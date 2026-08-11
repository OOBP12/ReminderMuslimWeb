const CACHE_NAME =
  "remindermuslim-v3";


const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png"
];



/* =============================
   INSTALL
============================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(cache => {

          return cache.addAll(
            APP_FILES
          );

        })

        .then(() => {

          return self.skipWaiting();

        })

    );

  }
);



/* =============================
   ACTIVATE
============================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()

        .then(keys => {

          return Promise.all(

            keys

              .filter(
                key =>
                  key !== CACHE_NAME
              )

              .map(
                key =>
                  caches.delete(key)
              )

          );

        })

        .then(() => {

          return self.clients.claim();

        })

    );

  }
);



/* =============================
   FETCH
============================= */

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    const requestUrl =
      new URL(
        event.request.url
      );


    /*
      Jangan intercept API luar
      seperti Aladhan.
    */

    if (
      requestUrl.origin !==
      self.location.origin
    ) {

      return;

    }


    /*
      PAGE / NAVIGATION

      Online:
      ambil versi terbaru.

      Offline:
      guna cache.
    */

    if (
      event.request.mode ===
      "navigate"
    ) {

      event.respondWith(

        fetch(event.request)

          .then(response => {

            const copy =
              response.clone();


            caches
              .open(CACHE_NAME)

              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              });


            return response;

          })

          .catch(() => {

            return caches.match(
              "./index.html"
            );

          })

      );


      return;

    }


    /*
      STATIC FILES

      Cache dahulu,
      kemudian internet.
    */

    event.respondWith(

      caches
        .match(event.request)

        .then(cached => {

          if (cached) {

            return cached;

          }


          return fetch(
            event.request
          )

            .then(response => {

              const copy =
                response.clone();


              caches
                .open(CACHE_NAME)

                .then(cache => {

                  cache.put(
                    event.request,
                    copy
                  );

                });


              return response;

            });

        })

    );

  }
);