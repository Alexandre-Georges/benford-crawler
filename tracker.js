const urlsToProcess = [];
const urlsBeingProcessed = [];
const urlsProcessed = [];

const addUrlsToProcess = urls => {
  for (const url of urls) {
    if (urlsBeingProcessed[url] === undefined && urlsProcessed[url] === undefined) {
      urlsToProcess[url] = true;
    }
  }
};

const getNextUrlToProcess = () => {
  const keys = Object.keys(urlsToProcess);
  if (keys.length === 0) {
    return null;
  }
  const url = keys[0];
  delete urlsToProcess[url];
  return url;
};

const moveUrlsToProcessToBeingProcessed = urls => {
  for (const url of urls) {
    delete urlsToProcess[url];
    urlsBeingProcessed[url] = true;
  }
};

const deleteUrlBeingProcessed = url => delete urlsBeingProcessed[url];
const setUrlProcessedResult = (url, result) => urlsProcessed[url] = result;

const isAllProcessed = () => Object.keys(urlsToProcess).length === 0 && Object.keys(urlsBeingProcessed).length === 0;

const generateReport = () => {
  let report = '';

  for (const urlProcessed of Object.keys(urlsProcessed)) {
    report += `${urlProcessed}: ${urlsProcessed[urlProcessed]}\n`;
  }

  report += `\n${Object.keys(urlsProcessed).length} URL(s) processed\n`;
  report += `${Object.keys(urlsBeingProcessed).length} URL(s) being processed\n`;
  report += `${Object.keys(urlsToProcess).length} URL(s) to process\n`;

  return report;
};


module.exports = {
  addUrlsToProcess,
  getNextUrlToProcess,
  moveUrlsToProcessToBeingProcessed,
  deleteUrlBeingProcessed,
  setUrlProcessedResult,
  isAllProcessed,
  generateReport,
};