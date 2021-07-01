/*********************** Requirement 
		   express  ***********************/
const express = require("express");
const app = express();
exports.app = app;
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");
/*********************** Engine 
		   handlebars  ***********************/
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
/*********************** Static 
		   Path  ***********************/
app.use(express.static("./public"));
/*********************** Middleware  
		   requirement***********************/
app.use(
  express.urlencoded({
    extended: false,
  })
);
/*********************** Cookie  
		   Session***********************/
app.use(
  cookieSession({
    secret: ` On my Way !`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  })
);
/*********************** Csurf  
		  Token***********************/
app.use(csurf());
app.use((req, res, next) => {
  res.set("X-Frame-Options", "deny");
  res.locals.csrfToken = req.csrfToken();
  next();
});

/*********************** main  
		 route***********************/
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/petition");
  } else {
    res.redirect("/register");
  }
});
/*********************** Register  
		 get***********************/
app.get("/register", (req, res) => {
  if (req.session.user) {
    res.redirect("/petition");
  } else {
    res.render("register");
  }
});
/*********************** Register  
		 Post***********************/
app.post("/register", (req, res) => {
  let first = req.body.first;
  let last = req.body.last;
  let email = req.body.email;
  let password = req.body.pw;

  if (first != "" && last != "" && email != "" && password != "") {
    hash(password)
      .then((hashPassword) => {
        return db.getRegister(first, last, email, hashPassword);
      })
      .then((results) => {
        req.session.user = {
          first: first,
          last: last,
          userId: results.rows[0].id,
        };
        res.redirect("/profile");
      })
      .catch((err) => {
        res.render("register");
      });
  } else {
    res.render("register");
  }
});

/*********************** login 
		 get***********************/
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/petition");
  } else {
    res.render("login");
  }
});
/*********************** login 
		 post***********************/
app.post("/login", (req, res) => {
  let password = req.body.pw;
  let email = req.body.email;
  let first;
  let last;
  let hashPassword;
  let id;
  req.session.user = {};

  db.getLogin(email)
    .then((results) => {
      // continue
      hashPassword = results.rows[0].password;
      id = results.rows[0].id;
      console.log("hashedPassword", hashPassword);
      console.log("the id ", id);
      first = results.rows[0].first;
      last = results.rows[0].last;
      return hashPassword;
    })
    .then((hashPassword) => {
      return compare(password, hashPassword);
    })
    .then((ifMatch) => {
      if (ifMatch) {
        req.session.user = {
          fName: first,
          lName: last,
          userId: id,
        };

        return req.session.user.userId;
      } else if (!ifMatch) {
        res.render("login");
      }
    })
    .then((userId) => {
      db.getSignatures(userId)
        .then((signatureId) => {
          if (signatureId.rows[0].id) {
            req.session.user.signatureId = signatureId.rows[0].id;
            res.redirect("/thanks");
          } else if (!signatureId.rows[0].id) {
            res.redirect("/petition");
          }
        })
        .catch((err) => {
          console.log("You still have an error in the Signature!");
        });
    })
    .catch((err) => {
      res.render("login");
    });
});

/*********************** profile 
		 get***********************/
app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.render("profile");
  } else {
    res.redirect("/register");
  }
});

/*********************** petition  
		post***********************/
app.post("/petition", (req, res) => {
  let signature = req.body.signature;
  console.log(signature);
  const { user } = req.session;
  if (signature != "") {
    db.getAccess(signature, user.userId)
      .then((results) => {
        user.signatureId = results.rows[0].id;

        res.redirect("/thanks");
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (signature == "") {
    res.render("petition");
  }
});

/*********************** petition 
		get***********************/

app.get("/petition", (req, res) => {
  if (req.session.user.signatureId) {
    res.redirect("/thanks");
  } else {
    res.render("petition");
  }
});
/*********************** profile 
		post***********************/
app.post("/profile", (req, res) => {
  let age = req.body.age;
  let city = req.body.city;
  let url = req.body.url;
  const { user } = req.session;

  db.getProfileInfo(age, city, url, user.userId)
    .then(() => {
      res.redirect("/petition");
    })
    .catch((err) => {
      res.render("profile");
    });
});
/*********************** profile 
		Edit***********************/
app.get("/profile/edit", (req, res) => {
  const { user } = req.session;
  db.getDisplay(user.userId).then((results) => {
    res.render("edit", {
      results,
    });
  });
});
app.post("/profile/edit", (req, res) => {
  let first = req.body.first;
  let last = req.body.last;
  let email = req.body.email;
  let pw = req.body.pw;
  let age = req.body.age;
  let city = req.body.city;
  let url = req.body.url;
  const { user } = req.session;

  if (pw != "") {
    hash(pw).then((hashPassword) => {
      Promise.all([
        db.getUpdate(first, last, email, hashPassword, user.userId),
        db.getProfileInfo(age, city, url, user.userId),
      ])
        .then(() => {
          user.edit = true;

          user.firstName = first;

          user.lastName = last;

          res.redirect("/thanks");
        })
        .catch((error) => {
          db.displayInfo(user.userId)
            .then((results) => {
              results.error = true;
              res.render("edit", {
                results,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        });
    });
  } else {
    Promise.all([
      db.getUpdateInfo(first, last, email, user.userId),
      db.getProfileInfo(age, city, url, user.userId),
    ])
      .then(() => {
        user.edit = true;
        user.firstName = first;
        user.lastName = last;
        res.redirect("/thanks");
      })
      .catch((err) => {
        console.log("Error in partial update: ", err);

        db.displayInfo(user.userId)
          .then((results) => {
            results.error = true;
            res.render("edit", {
              results,
            });
          })
          .catch((err) => {
            console.log("Error in re-rendering /thanks: ", err);
          });
      });
  }
});

app.post("/thanks/delete", (req, res) => {
  db.getDelete(req.session.user.userId)
    .then(() => {
      // delete signature ID cookie
      delete req.session.user.signatureId;

      res.redirect("/petition");
    })
    .catch((error) => {
      console.log("Error in deleteSignature: ", error);
    });
});

/*
Thanks page
*/
app.get("/thanks", (req, res) => {
  const { user } = req.session;
  let supportNumber;
  if (user.signatureId) {
    db.getSigners()
      .then((results) => {
        supportNumber = results;
        console.log(supportNumber);
      })
      .catch((err) => {
        console.log("error");
      });
    db.getSignature(user.signatureId)
      .then((results) => {
        if (user.edit) {
          delete user.edit;
          res.render("thanks", {
            signature: results,
            number: supportNumber,
          });
        } else {
          res.render("thanks", {
            signature: results,
            number: supportNumber,
          });
        }
      })
      .catch((error) => {
        console.log("Catching errors in the thanks page", error);
      });
  } else {
    console.log("You are going to the petition to resign again");
    res.redirect("/petition");
  }
});
/*
Signers page
*/
app.get("/signers", (req, res) => {
  const { user } = req.session;

  if (user) {
    if (user.signatureId) {
      db.getSupport()
        .then((results) => {
          return results.rows;
        })
        .then((results) => {
          res.render("signers", { people: results });
        })
        .catch((error) => {
          console.log("Error in getSupporters: ", error);
        });
    } else {
      // if no signature, back to signing!
      res.redirect("/petition");
    }
  } else {
    res.redirect("/register");
  }
});

app.get("/signers/:city", (req, res) => {
  const { user } = req.session;

  if (user) {
    const city = req.params.city;

    db.getCity(city)
      .then((results) => {
        console.log(results.rows);
        return results.rows;
      })
      .then((results) => {
        res.render("city", { place: city, cityResults: results });
      })
      .catch((errors) => {
        console.log("There is an error");
      });
  } else {
    res.redirect("/register");
  }
});
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
/*
listening
*/
if (require.main === module) {
  app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server is listening")
  );
}
