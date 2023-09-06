const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProduct(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const title = $("._35KyD6").text();
  const price = $("._1vC4OE._3qQ9m1").text();
  const images = [];
  $("._2_AcLJ").each((i, elem) => {
    images.push($(elem).css("background-image").slice(5, -2));
  });

  return { title, price, images };
}

async function scrapeSearchResults() {
  const searchQuery = "mobiles";
  const response = await axios.get(
    `https://www.flipkart.com/search?q=${searchQuery}`
  );

  const $ = cheerio.load(response.data);
  const productLinks = [];

  $("._31qSD5").each((i, element) => {
    const relativeLink = $(element).find("a").attr("href");
    productLinks.push(`https://www.flipkart.com${relativeLink}`);
  });

  const products = [];
  for (let i = 0; i < productLinks.length; i++) {
    const productData = await scrapeProduct(productLinks[i]);
    products.push(productData);
  }

  fs.writeFile("products.json", JSON.stringify(products, null, 2), (err) => {
    if (err) throw err;
    console.log("Data successfully written to file");
  });
}

scrapeSearchResults();
