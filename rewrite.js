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
  const { logger } = trifid

  return async (req, res, next) => {
    logger.info('rewriting…')

    console.log(req.path)

    req.iri = req.iri.replaceAll('http://0.0.0.0:8080', "https://ld.zazuko.com")

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


    console.log(headers)

    console.log(content);


    console.log(req.iri)


    return Readable.from(content.replaceAll("https://ld.zazuko.com", 'http://0.0.0.0:8080')).pipe(writable);
  }
}

export default factory
