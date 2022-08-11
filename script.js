async function handleRequest(request) {
  // Only GET requests work with this proxy.
  if (request.method !== 'GET') return MethodNotAllowed(request);

  const url = new URL(request.url);

  path = url.pathname;
  console.log(`path : $${path}`);

  hostPath = path.split(/^\/([\w.]+)\/([\w.]+)\/([\w.-_]+)/s).filter(Boolean);
  console.log(hostPath);
  if (hostPath[0] !== "cfworkerdemo") {
    console.log(`Not cfworkerdemo path: $${path}`);
    return;
  }
  if (hostPath.length != 3) {
    console.log(`Got invalid path: $${path}`);
    return;
  }

  desiredHost = hostPath[1];
  console.log(`desiredHost : $${desiredHost}`);

  desiredPath = hostPath[2];
  console.log(`desiredPath : $${desiredPath}`);

  const cacheKey = `https://$${url.hostname}$${url.pathname}`;

  console.log(`cache key : $${cacheKey}`);

  const desiredUrl = new URL(desiredPath, `https://$${desiredHost}`);
  const fetchUrl = desiredUrl.toString();

  console.log(`fetch URL : $${fetchUrl}`);

  const cacheTtl = 300;

  let response = await fetch(fetchUrl, {
    cf: {
      cacheTtl: cacheTtl,
      cacheEverything: true,
      cacheKey: cacheKey,
    },
  });

  // Reconstruct the Response object to make its headers mutable.
  response = new Response(response.body, response);

  // Set cache control headers to cache on browser for 25 minutes
  response.headers.set('Cache-Control', 'max-age=1500');
  return response;
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request));
});
