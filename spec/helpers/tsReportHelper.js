
jasmine.getEnv().clearReporters(); // Clear default console reporter

var jasmineReporters = require('jasmine-reporters');
jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({verbosity: 3, color: true, showStack: false}));
jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({savePath: 'spec/results', consolidateAll: false}));
