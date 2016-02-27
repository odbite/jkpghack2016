#!/bin/sh

pushd `dirname $0` > /dev/null
python server/server.py
popd > /dev/null
