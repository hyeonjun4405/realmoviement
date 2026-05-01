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
        oneLine: data.review ?? data.shortReview ?? data.comment ?? "",
        detailedreview: data.review ?? data.detailedReview ?? "",
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(movies, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
