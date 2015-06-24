var fs = require('fs');
var expect = require('chai').expect;
var vm = require('vm');
var sinon = require('sinon');

describe('Events tests', function(){
    vm.runInThisContext(fs.readFileSync('./src/core/utils/events.js'));
    describe('bind()', function(){
        it('should', function(){

        });
    });
});
