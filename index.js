const express = require("express");
const app = express();
app.use(express.json());

const authorsStorage = new Map();
const booksStorage = new Map();
const salesStorage = new Map(); // creating empty in-memory database using Map.

// Seed some data
let authors = [
  {
    authorId: 1,
    name: "Priya Sharma",
    email: "priya@email.com",
    bank: "1234567890",
    IFSC: "HDFC0001234",
  },
  {
    authorId: 2,
    name: "Rahul Verma",
    email: "rahul@email.com",
    bank: "0987654321",
    IFSC: "ICIC0005678",
  },
  {
    authorId: 3,
    name: "Anita Desai",
    email: "anita@email.com",
    bank: "5678901234",
    IFSC: "SBIN0009012",
  },
];

authors.map((aut) => authorsStorage.set(aut.authorId, aut));

let books = [
  { bookId: 1, bookName: "The Silent River", authorId: 1, royalty: 45 },
  { bookId: 2, bookName: "Midnight in Mumbai", authorId: 1, royalty: 60 },
  { bookId: 3, bookName: "Code & Coffee", authorId: 2, royalty: 75 },
  { bookId: 4, bookName: "Startup Diaries", authorId: 2, royalty: 50 },
  { bookId: 5, bookName: "Poetry of Pain", authorId: 2, royalty: 30 },
  { bookId: 6, bookName: "Garden of Words", authorId: 3, royalty: 40 },
];

books.map((b) => booksStorage.set(b.bookId, b));

let sales = [
  {
    saleBookId: 1,
    saleBookName: "Silent River",
    copiesNo1: 25,
    copiesOn1: "2025-01-05",
    copiesNo2: 40,
    copiesOn2: "2025-01-12",
  },
  {
    saleBookId: 2,
    saleBookName: "Midnight in Mumbai",
    copiesNo1: 15,
    copiesOn1: "2025-01-08",
  },
  {
    saleBookId: 3,
    saleBookName: "Code & Coffee",
    copiesNo1: 60,
    copiesOn1: "2025-01-03",
    copiesNo2: 45,
    copiesOn2: "2025-01-15",
  },
  {
    saleBookId: 4,
    saleBookName: "Startup Diaries",
    copiesNo1: 30,
    copiesOn1: "2025-01-10",
  },
  {
    saleBookId: 5,
    saleBookName: "Poetry of Pain",
    copiesNo1: 20,
    copiesOn1: "2025-01-18",
  },
  {
    saleBookId: 6,
    saleBookName: "Garden of Words",
    copiesNo1: 10,
    copiesOn1: "2025-01-20",
  },
];

sales.map((s) => salesStorage.set(s.saleBookId, s));

// Returns a list of all authors with their calculated total earnings and current balance.
// Each author should include: id, name, total_earnings, current_balance

//total copies;
const getTotalCopies = (sale) => {
  let copies1 = sale.copiesNo1 || 0;
  let copies2 = sale.copiesNo2 || 0;
  return copies1 + copies2;
};




app.get("/authors", (req, res) => {
  //total copies;

  const bookEarning = sales.map((sale) => ({
    bookId: sale.saleBookId,
    totoalCopies: getTotalCopies(sale), // just calling the function here with am argument;
  }));
  console.log(bookEarning, "bookEarning");

  //calculating royality;

  const booksWithEarning = books.map((book) => {
    const sale = bookEarning.find((e) => e.bookId === book.bookId);
    console.log(sale, "sale");

    return {
      ...book,
      totoalCopies: sale ? sale.totoalCopies : 0,
      totalEarnings: (sale ? sale.totoalCopies : 0) * book.royalty,
    };
  });
  console.log(booksWithEarning, "booksWithEarning");

  // calculating total author's earnings ;
  const autherWithEarning = authors.map((a) => {
    const authorBooks = booksWithEarning.filter(
      (b) => b.authorId === a.authorId,
    );
    console.log(authorBooks, "authorBooks");
    const totalEarnings = authorBooks.reduce(
      (acc, curr) => acc + curr.totalEarnings,
      0,
    );
    console.log(totalEarnings, "totalEarnings");

    return {
      id: a.authorId,
      name: a.name,
      total_earnings: totalEarnings,
      current_balance: totalEarnings,
    };
  });
  res.json(autherWithEarning);
});






//2. GET /authors/{id}
// Returns detailed information about one author, including their list of books with sales data.
// Should include: id, name, email, current_balance, total_earnings, total_books, and a books array
// Each book should show: id, title, royalty_per_sale, total_sold, total_royalty
// If author doesn't exist: Return HTTP 404 with an error message

app.get('/authors/:id', (req, res) => {
  const authorId = parseInt(req.params.id);

  //finding author;
  const author = authors.find((a) => a.authorId === authorId);
  console.log(author, "author"); 

    if (!author) {
    return res.status(404).json({ error: "Author not found" });
  }

  const authorsListBook = books.filter((b) => b.authorId === authorId); 
  console.log(authorsListBook, "authorsListBook"); 

//   adding sales data with books; 
const booksWithSalesData = authorsListBook.map((b) => {
    const sale = sales.find((s) => s.saleBookId === b.bookId); 
    const totalSold = sale ? getTotalCopies(sale) : 0;  // Use helper function; 
    console.log(totalSold, "totalSold"); 

    return {
      id: b.bookId,
      title: b.bookName,
      royalty_per_sale: b.royalty,
      total_sold: totalSold,
      total_royalty: totalSold * b.royalty
    };
})

const totalEarnings = booksWithSalesData.reduce((acc, curr) => acc + curr.total_royalty, 0);

// STEP 4: Send final response; 

  res.json({
    id: author.authorId,
    name: author.name,
    email: author.email,
    current_balance: totalEarnings,
    total_earnings: totalEarnings,
    total_books: authorsListBook.length,
    books: booksWithSalesData
  });

})


//3. GET /authors/{id}/sales
// Returns all sales for an author's books, sorted by date (newest first).
// Each sale should show: book_title, quantity, royalty_earned, sale_date

app.get('/authors/:id/sales', (req, res) => {
    const authorId = parseInt(req.params.id); 

    //finding author; 
    const author = authors.find((a) => a.authorId === authorId); 
    if(!author){
        return res.status(404).json({error: "Author not found"}); 
    }

    //getting author's book; 
    const authorBooks = books.find((b) => b.authorId === authorId); 
    console.log(authorBooks, "authorBooks"); 

    // all sales for an author book; 
    const authorSales = []; 

    authorBooks.map((authBook) => {
        const bookSales = sales.filter((s) => s.saleBookId === authBook.bookId); 

        bookSales.map((sale) => {
            // Handling single sale OR split double sales; 
            const sale1 = {
                saleBookId: sale.saleBookId, 
                book_title: sale.saleBookName || books.find((b) => b.bookId === sale.saleBookId)?.bookName, 
                quantity: sale.copiesNo1 || 0,
                sale_date: sale.copiesOn1
            }; 


            const sale2 = {
                saleBookId: sale.saleBookId, 
                book_title: sale.saleBookName || books.find((b) => b.bookId === sale.saleBookId)?.bookName, 
                quantity: sale.copiesNo2 || 0,
                sale_date: sale.copiesOn2
            };

            authorSales.push(sale1); 
            if(sale2.quantity > 0){
                authorSales.push(sale2); 
            }
        }); 
    }); 


    //sorting by newest first date; 
    authorSales.sort((a, b) => new Date(b.))

    // authorSales




})





let PORT = 9000;

app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});

//my own;

// const gameStorage = new Map();

// let game = [
// {id: 1, name: "Badmintion", size: 12,  price1: 50,  price2: 20},
// {id: 1, name: "Badmintion", size: 12,  price1: 30,  price2: 30}
// ]

// game.map((gme) => gameStorage.set(gme.id, gme));

// // app.get('/games', (req, res) => {
// //     res.json(Array.from(gameStorage.values()));
// // });

// app.get('/games', (req, res) => {
//   const gamesArray = Array.from(gameStorage.values());
//   const totalPrice = gamesArray.reduce((sum, g) => sum + g.price1 + g.price2, 0);

//   res.json({ games: gamesArray, totalPrice });
// });
