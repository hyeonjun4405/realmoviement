const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",

  // 캐시 방지
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
};

exports.handler = async function () {
  try {
    const snapshot = await db
      .collection("artifacts")
      .doc("my-movie-app-v1")
      .collection("public")
      .doc("data")
      .collection("movies")
      .get();

    const movies = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        title: data.title ?? data.name ?? "",
        rating: data.rating ?? data.score ?? null,

        oneLine:
          data.oneLine ??
          data.review ??
          data.comment ??
          data.reviewText ??
          "",

        detailedreview:
          data.detailedreview ??
          data.detailedReview ??
          data.detailReview ??
          "",


        // 임시 확인용: 실제 Firestore 원본 필드
        raw: data,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          count: movies.length,
          movies,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          error: error.message,
        },
        null,
        2
      ),
    };
  }
};
