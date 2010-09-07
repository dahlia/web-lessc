web-lessc: A simple HTTP API of [LESS][] compiler
=================================================

It is a simple HTTP API of [LESS][] compiler. 

  [less]: http://github.com/cloudhead/less.js

You can pass the URL of the LESS source code as `url=` `GET` parameter or
the LESS source code data as `POST` request body.


Parameters
----------

`url=`
:   The URL of the LESS source code. It is required until you request as `POST`
    with request data contains the LESS source code.

`compress=`
`x=`
:   Compress the result CSS code if it is `true`. Default is `false`.

`optimization=`
`O=`
`o=`
:   Optimization level from `0` to `2`. Default is `1`.

`silent=`
`s=`
:   Omit error messages.


Example: `GET`
--------------

    GET /lessc/?url=http:%2F%2Fyoursite.com%2Ffile.less HTTP/1.1
    Host: dahlia.ruree.net


Example `POST`
--------------

    POST /lessc/ HTTP/1.1
    Host: dahlia.ruree.net

    .your.less-code { goes: here }


When errored
------------

    HTTP/1.1 500 Internal Server Error
    Content-Type: text/css
    Connection: keep-alive
    Transfer-Encoding: chunked

    /*
    Error:

    1 a {
         ^
    ...


Author and source code
----------------------

The author is Hong Minhee. <http://dahlia.kr/>

Source code is available on its repository under Public Domain license.
<http://github.com/dahlia/web-lessc>

