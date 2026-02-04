const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// ✅ Transport API
app.get("/api/transports/:type", (req, res) => {
  const type = req.params.type;

  const data = Array.from({ length: 5 }, (_, i) => ({
    name: `${type} ${i + 1}`,
    price: Math.floor(Math.random() * 1000) + 300
  }));

  res.json(data);
});


// ✅ Hotel API
app.get("/api/hotels/:city", (req, res) => {
  const city = req.params.city;

  const hotels = Array.from({ length: 5 }, (_, i) => ({
    name: `${city} Hotel ${i + 1}`,
    rating: (4 + Math.random()).toFixed(1),
    price: 2000 + i * 400
  }));

  res.json(hotels);
});


// ✅ Booking API
app.post("/api/book", (req, res) => {
  console.log("Booking received:", req.body);

  res.json({
    status: "success",
    message: "Booking confirmed"
  });
});


app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
