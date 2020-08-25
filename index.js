const { Worker } = require('worker_threads');
const benford = require('./benford');
const tracker = require('./tracker');

const RUNNERS_NUMBER = 10;
const MAX_URLS_PER_RUNNER = 5;

const DOMAIN_NAME = process.argv.length > 2 ? process.argv[2] : 'http://www.soyuzcoffee.com';

let numberOfActiveRunners = 0;
const runners = [];

const onWorkerOnline = () => {};

const onWorkerMessage = (runnerIndex, message) => {
  const runner = runners[runnerIndex];
  runner.numberOfUrls -= 1;

  tracker.deleteUrlBeingProcessed(message.urlProcessed);
  tracker.setUrlProcessedResult(message.urlProcessed, message.result);
  tracker.addUrlsToProcess(message.urlsFound);

  benford.addNumbers(message.numbers);

  if (runner.numberOfUrls === 0 && tracker.isAllProcessed()) {
    quitWorker(runner);
    removeDeadWorkers();

    if (numberOfActiveRunners === 0) {
      printRecap();
    }
  } else {
    sendUrlsToWorkers();
  }
};

const printRecap = () => {
  console.log('\n');
  console.log(tracker.generateReport());
  console.log(benford.generateReport());
  console.log('\n');
};

const onWorkerMessageError = (runnerIndex, error) => {
  console.log(`Problem with worker message ${runnerIndex}: ${error}`);
};

const onWorkerError = (runnerIndex, error) => {
  console.log(`Problem with worker ${runnerIndex}: ${error}`);
};

const onWorkerExit = (runnerIndex, code) => {
  if (code !== 0) {
    console.log(`Worker ${runnerIndex} exited with an error ${code}`);
  }
};

const sendUrlsToWorkers = () => {
  let runnerIndex = 0;
  let runner = runners[runnerIndex];
  let workerUrls = [];

  while (runnerIndex < runners.length) {
    if (runner.numberOfUrls + 1 <= MAX_URLS_PER_RUNNER) {
      const url = tracker.getNextUrlToProcess();
      if (url === null) {
        break;
      }
      workerUrls.push(url);
    } else {
      if (workerUrls.length > 0) {
        sendMessageToWorker(runner, workerUrls);
        workerUrls = [];
      }
      runnerIndex++;
      runner = runners[runnerIndex];
    }
  }
  if (workerUrls.length > 0) {
    sendMessageToWorker(runner, workerUrls);
    workerUrls = [];
  }
};

const sendMessageToWorker = (runner, urls) => {
  tracker.moveUrlsToProcessToBeingProcessed(urls);
  runner.numberOfUrls += urls.length;
  runner.worker.postMessage({ type: 'NEW_URLS', urls });
};

const quitWorker = runner => {
  runner.worker.postMessage({ type: 'QUIT' });
  delete runners[runner.index];
  numberOfActiveRunners--;
};

const removeDeadWorkers = () => {
  for (let i = 0; i < RUNNERS_NUMBER; i++) {
    const runner = runners[i];
    if (runner) {
      quitWorker(runner);
    }
  }
};

for (let i = 0; i < RUNNERS_NUMBER; i++) {
  const worker = new Worker('./worker.js', { workerData: { config: { domainName: DOMAIN_NAME } } });
  runners[i] = {
    worker,
    index: i,
    numberOfUrls: 0,
  }
  worker.on('online', () => onWorkerOnline(i));
  worker.on('message', message => onWorkerMessage(i, message));
  worker.on('messageerror', error => onWorkerMessageError(i, error));
  worker.on('error', error => onWorkerError(i, error));
  worker.on('exit', code => onWorkerExit(i, code));
  numberOfActiveRunners++;
}

tracker.addUrlsToProcess([DOMAIN_NAME])

sendUrlsToWorkers();
