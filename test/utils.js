var fs = require('fs');
var expect = require('chai').expect;
var vm = require('vm');

describe('Utils tests', function(){
    vm.runInThisContext(fs.readFileSync('./src/core/utils/utils.js'));

    describe('noop()', function(){
        it('should return undefined', function(){
            expect(utils.noop()).to.be.an('undefined');
        });
    });

    describe('guid()', function(){
        it('should return GUID with valid format', function(){
            var guidRegEx = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-4([0-9a-fA-F]){3}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
            expect(guidRegEx.test(utils.guid())).to.be.true;
        });

        it('should return unique GUIDs (test sample of 5 elements)', function(){
            var guids = [];

            for(var i = 0; i < 5; i++){
                guids.push(utils.guid());
            }

            for(var i = 0; i < 4; i++){
                expect(guids.indexOf(guids[i], i + 1)).to.equal(-1);
            }
        });
    });

    describe('isFunction()', function(){
        it('should return true when function is passed', function(){
            expect(utils.isFunction( function(){} )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isFunction( {} )).to.be.false;
        });

        it('should return false when simple string is passed', function(){
            expect(utils.isFunction( 'test string' )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isFunction( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isFunction( undefined )).to.be.false;
        });
    });

    describe('isArray()', function(){
        it('should return true when array object is passed', function(){
            expect(utils.isArray( [1] )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isArray( {} )).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isArray( 100500 )).to.be.false;
        });

        it('should return false when string is passed', function(){
            expect(utils.isArray( 'test string' )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isArray( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isArray( undefined )).to.be.false;
        });
    });

   describe('isArrayLike()', function(){
        it('should return true when array object is passed', function(){
            expect(utils.isArrayLike( [1] )).to.be.true;
        });

        it('should return true when string is passed', function(){
            expect(utils.isArrayLike( 'test string' )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isArrayLike( {} )).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isArrayLike( 100500 )).to.be.false;
        });

        it('should return false when bool is passed', function(){
            expect(utils.isArrayLike( true )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isArrayLike( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isArrayLike( undefined )).to.be.false;
        });
    });

    describe('isString(arg)', function(){
        it('should return true when string object is passed', function(){
            expect(utils.isString('Lorem ipsum')).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isString({str: "Lorem ipsum"})).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isString(4)).to.be.false;
        });

        it('should return false when bool is passed', function(){
            expect(utils.isString( true )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isString(undefined)).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isString(null)).to.be.false;
        });
    });

    describe('isAccessKey(arg)', function(){
        it('should return true when valid access key is passed', function(){
            expect(utils.isAccessKey('dlaSz1+bV3z07vODnM7ICWKHQnl9hIuPX0KUHjlmfSY=')).to.be.true;
        });

        it('should return false when access key with invalid characters(-, !, #, %, *)is passed', function(){
            expect(utils.isAccessKey('dlaSz1+bV3z-7v!Dn#7ICW%HQn*9hIuPX0KUHjlmfSY='))
            .to.be.false;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isAccessKey({str: "Lorem ipsum"})).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isAccessKey(4)).to.be.false;
        });

        it('should return false when bool is passed', function(){
            expect(utils.isAccessKey( true )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isAccessKey(undefined)).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isAccessKey(null)).to.be.false;
        });
    });

    describe('inArray()', function(){
        it('should return position of searched value in Array starting from the specified index', function(){
            expect(utils.inArray(3, [1, 2, 3], 1)).to.equal(2);
        });

        it('should return position of searched value in Array', function(){
            expect(utils.inArray(1, [1, 2, 3])).to.equal(0);
        });

        it('should return -1 when searched value isn\'t present in Array starting from the specified index', function(){
            expect(utils.inArray(1, [1, 2, 3], 1)).to.equal(-1);
        });

        it('should return -1 when searched value isn\'t present in Array', function(){
            expect(utils.inArray(10, [1, 2, 3])).to.equal(-1);
        });

        it('should return position of searched value in collection of elments with different types', function(){
            expect(utils.inArray('Lorem ipsum', [1, 2.5, { a: 5, b: 'str'}, 'Lorem ipsum', true, null, undefined]), 1)
            .to.equal(3);
        });

        it('should throw exception if non-array object is passed', function(){
            expect(function(){ utils.inArray(1, 15); }).to.throw(TypeError);
        });
    });

    describe('map()', function(){
        it('should return valid array with applied map function', function(){
            expect(utils.map([15, 8, 3], function(){ return this + 5; })).to.deep.equal([20, 13, 8]);
        });

        it('should return valid array with applied map function', function(){
            expect(utils.map(['str1', 'str2', 'str3'], function(){ return this + 'test'; }))
            .to.deep.equal(['str1test', 'str2test', 'str3test']);
        });

        it('should pass array index as the first argument to mapper function', function(){
            expect(utils.map(['str1', 'str2', 'str3'], function(arg){ return arg; }))
            .to.deep.equal([0, 1, 2]);
        });

        it('should pass initial index as the second argument to mapper function', function(){
            var initArray = ['str1'];
            expect(utils.map(initArray, function(arg, arg2){ return arg2; }))
            .to.deep.equal([initArray]);
        });

        it('should throw TypeError if non-array object is passed as the first argument', function(){
            expect(function(){ utils.map(undefined, function() { return this + 5; }); })
            .to.throw(TypeError);;
        });

        it('should throw TypeError if non-function object is passed as the second argument', function(){
            expect(function(){ utils.map([1, 2, 3], 'lorem ipsum'); })
            .to.throw(TypeError);
        });

        it('should return empty array if empty array is passed', function(){
            expect(utils.map([], function(){ this + 1; })).to.deep.equal([]);
        });
    });

    describe('reduce()', function(){
        it('should retun valid value for input array', function(){
            expect(utils.reduce([0, 1, 2, 3, 4], function(previousValue, currentValue, index, array) {
                return previousValue + currentValue;
            })).to.equal(10);
        });

        it('should retun valid value for input array', function(){
            expect(utils.reduce(['Lorem', 'ipsum', 'dolor', 'sit', 'amet'], function(a, b) {
                    return a.concat(' ' + b);
                })
            ).to.equal('Lorem ipsum dolor sit amet');
        });

        it('should throw TypeError if empty array is passed', function(){
            expect(function(){utils.reduce([], function(){ this + 1; }); }).to.throw(TypeError);
        });

        it('should throw TypeError if non-array object is passed as the first argument', function(){
            expect(function(){ utils.reduce(undefined, function() { return this + 5; }); }).to.throw(TypeError);
        });

        it('should throw TypeError if non-function object is passed as the second argument', function(){
            expect(function(){ utils.reduce([1, 2, 3], undefined); }).to.throw(TypeError);
        });
    });

    describe('forEach()', function(){
        it('should execute callback function for each array element', function(){
            var sum = 0;
            utils.forEach([15, 8, 3], function(){ sum += this; });
            expect(sum).to.equal(26);
        });

        it('should pass element index to callback function', function(){
            var sum = [];
            utils.forEach([15, 8, 3], function(i){ sum.push(i); });
            expect(sum).to.deep.equal([0, 1, 2]);
        });

        it('should pass initial Array object callback function', function(){
            var sum = [];
            utils.forEach([15, 8, 3], function(i, arr){ sum = arr; });
            expect(sum).to.deep.equal([15, 8, 3]);
        });

        it('should deal with non-array object', function(){
            var obj = {
                a: 10,
                b: 20,
                c: 30
            }, sum = 0;
            utils.forEach(obj, function(){ sum += this; });
            expect(sum).to.equal(60);
        });

        it('should throw TypeError if non-function object is passed as the second argument', function(){
            expect(function(){ utils.forEach([1, 2, 3], undefined); }).to.throw(TypeError);
        });
    });

    describe('filter()', function(){
        it('should filter data in array according to callback function', function(){
            expect(utils.filter(['1', undefined, {a: 3}, false, 5, '3'], function(){
                return Object.prototype.toString.call(this) == '[object Number]';
            })).to.deep.equal([5]);
        });

        it('should filter data in array according to callback function', function(){
            expect(utils.filter(['1', undefined, {a: 3}, false, 5, '3'], function(){
                return Object.prototype.toString.call(this) === '[object Number]';
            })).to.deep.equal([5]);
        });

        /*it('should filter data in object according to callback function', function(){
            expect(utils.filter([1, 2, 3, 4], function(index, arr){console.log(arr[index]); console.log(this); return this === 4;})).to.deep.equal([4]);
        });*/

        it('should throw TypeError if non-function object is passed as the second argument', function(){
            expect(function(){ utils.filter([1, 2, 3], undefined); }).to.throw(TypeError);
        });
    });

    describe('toArray()', function(){
        it('should gather all input parameters to single array', function(){
            expect(function(){ return utils.toArray(arguments); }(1, 'Lorem ipsum', undefined, false))
            .to.deep.equal([1, 'Lorem ipsum', undefined, false]);
        });
    });

    describe('find()', function(){
        /*it('should return element matching search criteria (===) when it exists in input array', function(){
            expect(utils.find([1, 2, 3, 4], function(){return this === 4;}))
            .to.equal(4);
        });*/

        it('should return element matching search criteria (==) when it exists in input array', function(){
            expect(utils.find([1, 2, 3, 4], function(){return this == 4;}))
            .to.equal(4);
        });

        it('should return null when all input array elements don\'t match search criteria', function(){
            expect(utils.find([1, function(){}, true, 'Lorem ipsum', 2.5], function(){return this == 3.6;}))
            .to.be.null;
        });
    });

    describe('parseDate()', function(){
        it('should parse given valid string into Date object', function(){
            expect(utils.parseDate('2015-12-11')).to.deep.equal(new Date(2015, 11, 11));
        });

        it('should parse given valid string into Date object', function(){
            expect(utils.parseDate('1900/02/01/00/11/01/000'))
            .to.deep.equal(new Date(1900, 01, 01, 0, 11, 1, 0));
        });
    });

    describe('formatDate()', function(){
        it('should return same string if string object was passed', function(){
            expect(utils.formatDate('2015-12-11')).to.equal('2015-12-11');
        });

        it('should throw error if non-string and non-Date object was passed', function(){
            expect(function(){ utils.formatDate({}); }).to.throw(Error);
        });

        it('should return string date formatted', function(){
            var date = new Date(2015, 0, 16, 22, 11, 1, 0);
            expect(utils.formatDate(date)).to.equal('2015-01-' + date.getUTCDate() + 'T' + date.getUTCHours() + ':11:01.000');
        });
    });

    describe('encodeBase64()', function () {
        it('should return undefined if undefined was passed', function(){
            expect(utils.encodeBase64(undefined)).to.equal(undefined);
        });

        it('should return null if null was passed', function(){
            expect(utils.encodeBase64(null)).to.equal(null);
        });

        it('should return encoded base64 string', function(){
            expect(utils.encodeBase64('Test encodeBase64()'))
            .to.equal('VGVzdCBlbmNvZGVCYXNlNjQoKQ==');
        });
    });

    describe('createCallback()', function(){
        it('should return function that was passed as an argument', function(){
            var cb = function cb() {};
            expect(utils.createCallback(cb)).to.deep.equal(cb);
        });

        it('should create callback function if no function was passed as an argument', function(){
            expect(utils.createCallback(null)).to.be.a('Function');
        });
    });

    describe('serializeQuery()', function(){
        it('should return query string', function(){
            expect(utils.serializeQuery({key1: 'value1', key2: 2, key3: true}))
            .to.equal('key1=value1&key2=2&key3=true');
        });
        it('should return empty string', function(){
            expect(utils.serializeQuery(null)).to.equal('');
            expect(utils.serializeQuery(undefined)).to.equal('');
        });
    });

    describe('makeUrl()', function(){
        it('should return valid url', function(){
            expect(utils.makeUrl({method: 'POST', url: 'http://test.com'}))
            .to.equal('http://test.com');
        });

        it('should return valid url for GET method', function(){
            expect(utils.makeUrl({method: 'GET', url: 'http://test.com', data: {key1: 'value1', key2: 2, key3: true}}))
            .to.equal('http://test.com?key1=value1&key2=2&key3=true');
        });

        it('should return valid url for GET method and url that already has params', function(){
            expect(utils.makeUrl({method: 'GET', url: 'http://test.com?key0=value0', data: { key1: 'value1', key2: 2, key3: true }}))
            .to.equal('http://test.com?key0=value0&key1=value1&key2=2&key3=true');
        });
    });

    describe('serverErrorMessage()', function(){
        it('should return error message', function(){
            expect(utils.serverErrorMessage()).to.equal('DeviceHive server error');
        });

        it('should return error message with supplied text', function(){
            expect(utils.serverErrorMessage('testError')).to.equal('DeviceHive server error - testError');
        });

        it('should return error message with the text from message (lower case "m") field', function(){
            expect(utils.serverErrorMessage(null, { message: "testError" }))
            .to.contain('DeviceHive server error - testError');
        });

        it('should return error message with the text from Message (upper case "M") field', function(){
            expect(utils.serverErrorMessage(null, { Message: "testError" }))
            .to.contain('DeviceHive server error - testError');
        });

        it('should return error message with the text from ExceptionMessage field', function(){
            expect(utils.serverErrorMessage(null, { ExceptionMessage: "testError" }))
            .to.contain('DeviceHive server error - testError');
        });

        it('should return error message with the text from both message and ExceptionMessage fields', function(){
            expect(utils.serverErrorMessage(null, { message: "testError", ExceptionMessage: "testError" }))
            .to.contain('DeviceHive server error - testError testError');
        });
    });

    describe('errorMessage()', function(){
        it('should return error object with message', function(){
            expect(utils.errorMessage('test')).to.deep.equal({ error: 'DeviceHive error: test'});
        });
    });

    describe('setTimeout()', function(){
        it('should set timeout with right callback and delay', function(){
            var cb = function testCb() {};
            var result = utils.setTimeout(cb, 1111);
            expect(result).to.have.property('_idleTimeout', 1111);
            expect(result).to.have.property('_onTimeout').that.is.a('Function').and.deep.equal(cb)
        });
    });

});
