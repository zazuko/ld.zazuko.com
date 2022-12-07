import hijackResponse from 'hijackresponse'
import { Readable } from 'stream';

const getStream = async (stream) => {
  return new Promise(resolve => {
    const chunks = [];

    stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
  });
}

export const factory = trifid => {
  const { config, logger } = trifid
  const { datasetBaseUrl } = config

  // do nothing if datasetBaseUrl is not defined or empty
  if (!datasetBaseUrl) {
    return (_req, _res, next) => {
      return next();
    }
  }

  // check if it is a valid URL
  try {
    new URL(datasetBaseUrl)
  } catch (_e) {
    throw new Error(`The current value you have for 'datasetBaseUrl' is '${datasetBaseUrl}', which is not a valid URL.`);
  }

  return async (req, res, next) => {
    const absoluteBaseUrl = new URL('/', req.absoluteUrl())
    const currentBaseUrl = absoluteBaseUrl.toString()

    req.iri = req.iri.replaceAll(currentBaseUrl, datasetBaseUrl)
    logger.debug(`new IRI is ${req.iri}`)

    const { readable, writable } = await hijackResponse(res, next)
    if (!res.getHeaders) {
      return readable.pipe(writable);
    }

    const headers = res.getHeaders();
    if (!('content-type' in headers)) {
      return readable.pipe(writable);
    }

    if (headers['content-type'] !== 'application/sparql-results+json') {
      return readable.pipe(writable);
    }

    const content = await getStream(readable);
    return Readable.from(content.replaceAll(datasetBaseUrl, currentBaseUrl)).pipe(writable);
  }
}

export default factory
