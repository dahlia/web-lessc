require.paths.unshift(__dirname);

var less = require('less'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    path = require('path');

PORT = 8124;
ACCEPT = 'text/x-less; q=1.0, text/less; q=1.0, text/css; q=0.9, '
       + 'text/*; q=0.5, */*; q=0.1';
README_PATH = path.join(__dirname, 'README.md');

function formatError(err) {
  result = '/*\nError:\n\n';
  if (!err.index && err.stack) {
    result += err.stack;
  } else {
    if ('string' === typeof err.extract[0]) {
      result += (err.line - 1) + ' ' + err.extract[0] + '\n';
    }
    result += err.line + ' ' + err.extract[1] + '\n';
    for (var i = -err.line.toString().length; i < err.column; ++i) {
      result += ' ';
    }
    result += ' ^\n';
    if ('string' === typeof err.extract[2]) {
      result += err.line + 1 + ' ' + err.extract[2] + '\n';
    }
    if (err.callLine) {
      result += '\nfrom ' + err.filename || '(unknown filename)';
      result += '\n' + crr.callLine + ' ' + err.callExtract + '\n';
    }
    if (err.stack) {
      result += '\n' + err.stack + '\n';
    }
  }
  result += '\n\n*/';
  return result;
}

function process(res, data, options) {
  var parser = new less.Parser(options);
  var status = 200;
  var result = '';
  parser.parse(data, function (err, tree) {
    if (err) {
      status = 500;
      if (!options.silent) {
        result = formatError(err, options);
      }
    } else {
      try {
        result = tree.toCSS({ compress: options.compress });
      } catch (e) {
        if (!options.silent) {
          result = formatError(e, options);
        }
      }
    }
  });
  res.writeHead(status, { 'Content-Type': 'text/css' });
  res.end(result);
}

http.createServer(function (req, res) {
  var options = { compress: false,
                  optimization: 1,
                  silent: false };
  var params = querystring.parse(url.parse(req.url).query);
  var compress = params.compress || params.x;
  if (compress != 'false' && compress != 'no' && compress != '0' && compress) {
    options.compress = true;
  }
  var optimization = params.optimization || params.O || params.o;
  if (optimization == '0' || optimization == '1' || optimization == '2') {
    options.optimization = parseInt(optimization);
  }
  var silent = params.silent || params.s;
  if (silent != 'false' && silent != 'no' && silent != '0' && silent) {
    options.silent = true;
  }
  if (req.method == 'POST') {
    var data = '';
    req.addListener('data', function (chunk) {
      data += chunk;
    });
    req.addListener('end', function () {
      process(res, data, options);
    });
  } else if (params.url) {
    options.filename = params.url;
    var parsed_url = url.parse(params.url);
    var client = http.createClient(parsed_url.port || 80,
                                   parsed_url.host,
                                   parsed_url.protocol == 'https:' ||
                                   parsed_url.protocol == 'https');
    var path = parsed_url.pathname + (parsed_url.search || '');
    var client_req = client.request('GET', path, { Host: parsed_url.host,
                                                   Accept: ACCEPT });
    var data = '';
    client_req.addListener('response', function (client_res) {
      client_res.addListener('data', function (chunk) {
        data += chunk;
      });
      client_res.addListener('end', function () {
        process(res, data, options);
      });
    });
    client_req.end();
  } else {
    var host = req.headers['Host'] || req.headers['HOST'] ||
               req.headers['host'];
    res.writeHead(500, { 'Content-Type': 'text/css' });
    var readme = fs.readFileSync(README_PATH).toString();
    readme = readme.replace(/\{\{[[:space:]]*host[[:space:]]*\}\}/g, host);
    res.end('/*\n' + readme + '\n*/');
  }
}).listen(PORT);

