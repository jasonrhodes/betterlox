import { ratingClasses } from "@mui/material";
import {
  sequelize,
  User,
  Rating,
  Movie,
  Person
} from "./src/database/models";

main();

async function main() {
  try {
    // step through test steps here
    await testConnection();
    await sync();
    
    // const user = await createUser();
    // console.log("User created", user);

    // const users = await User.findAll({ limit: 5 });
    // console.log("Found users", users.map(user => user.get('email')));

    // const ratings = await Rating.findAll({ limit: 5, include: User });
    // console.log("Found ratings", ratings.map(rating => rating.toJSON()))

    // const usersWithRatings = await User.findAll({ limit: 5, plain: true, include: Rating });
    // // @ts-expect-error
    // console.log("Found users with ratings", usersWithRatings.ratings.map(r => r.dataValues));

    // const movies = await Movie.findAll({ limit: 5 });
    // console.log("Found movies", movies.map(movie => movie.get("title")));

    // const people = Person.findAll({ limit: 5 });
    // console.log("Found people", (await people).map(person => person.get("name")));

    const tb = await Movie.findByPk(9428);
    console.log(tb?.get("title"));
    // @ts-expect-error
    const cast = await tb?.getCast();
    console.log(cast[0].toJSON());

    console.log("OVERALL: SUCCESS");
  } catch (error) {
    console.log("OVERALL: FAILED", error);
  }
}

async function getUsers(limit: number) {
  return User.findAll({ limit });
}

async function createUser() {
  return User.create({
    email: "joey@bagodonuts.com",
    password: "ijgaoiaejgaw752352hqjh24515",
    salt: "saltsaltsaltsaltsaltsaltsaltsalt",
    letterboxdUsername: "joeyjojo",
    letterboxdName: "Joe",
    letterboxdAccountLevel: "basic",
    avatarUrl: "kjglhghahghqhguhghadhgadtauewhtuwehtq;htp43y98qyhtwhgajksdgh;dughp934yt98h3ughauiahsdughuwb3uphg97q43ygq43hg38pqh43ghqp8934gh8943hgq9348hg893h4g8q43yhg9h474qhg7h47t3yth4gqhgu4q3hg9q34pgh43pqigh43gp8h438qu3y4ity19p8y89570439875678tfwgouidshvd;bnuifh087qphbqf784phg78r94vbr278v4iuh794riuhvp92bv78vghv38iub78vb43b38vnqo8h3i4bvo3b98vib4ivub439vb3ifuvb3qiuvb3iu4bv8hbbi3kjglhghahghqhguhghadhgadtauewhtuwehtq;htp43y98qyhtwhgajksdgh;dughp934yt98h3ughauiahsdughuwb3uphg97q43ygq43hg38pqh43ghqp8934gh8943hgq9348hg893h4g8q43yhg9h474qhg7h47t3yth4gqhgu4q3hg9q34pgh43pqigh43gp8h438qu3y4ity19p8y89570439875678tfwgouidshvd;bnuifh087qphbqf784phg78r94vbr278v4iuh794riuhvp92bv78vghv38iub78vb43b38vnqo8h3i4bvo3b98vib4ivub439vb3ifuvb3qiuvb3iu4bv8hbbi3kjglhghahghqhguhghadhgadtauewhtuwehtq;htp43y98qyhtwhgajksdgh;dughp934yt98h3ughauiahsdughuwb3uphg97q43ygq43hg38pqh43ghqp8934gh8943hgq9348hg893h4g8q43yhg9h474qhg7h47t3yth4gqhgu4q3hg9q34pgh43pqigh43gp8h438qu3y4ity19p8y89570439875678tfwgouidshvd;bnuifh087qphbqf784phg78r94vbr278v4iuh794riuhvp92bv78vghv38iub78vb43b38vnqo8h3i4bvo3b98vib4ivub439vb3ifuvb3qiuvb3iu4bv8hbbi3kjglhghahghqhguhghadhgadtauewhtuwehtq;htp43y98qyhtwhgajksdgh;dughp934yt98h3ughauiahsdughuwb3uphg97q43ygq43hg38pqh43ghqp8934gh8943hgq9348hg893h4g8q43yhg9h474qhg7h47t3yth4gqhgu4q3hg9q34pgh43pqigh43gp8h438qu3y4ity19p8y89570439875678tfwgouidshvd;bnuifh087qphbqf784phg78r94vbr278v4iuh794riuhvp92bv78vghv38iub78vb43b38vnqo8h3i4bvo3b98vib4ivub439vb3ifuvb3qiuvb3iu4bv8hbbi3"
  });
}

async function sync() {
  return sequelize.sync();
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}