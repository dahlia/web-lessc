
all: less

less:
	git clone git://github.com/cloudhead/less.js.git
	mv less.js/lib/less less
	rm -rf less.js

