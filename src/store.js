/* eslint-disable import/no-anonymous-default-export */
/*eslint semi: "error"*/

const lists = [
  {
    "id": "1",
    "name": "Custom List"
  },
  {
    "id": "2",
    "name": "East Bay"
  },
  {
    "id": "3",
    "name": "Peninsula"
  },
  {
    "id": "4",
    "name": "South Bay"
  }
]

const cities = [
  {
    "id": "1",
    "listId": "1",
    "name": "San Francisco"
  },
  {
    "id": "2",
    "listId": "2",
    "name": "Fremont"
  },
  {
    "id": "3",
    "listId": "2",
    "name": "Walnut Creek"
  },
  {
    "id": "4",
    "listId": "1",
    "name": "Livermore"
  },
  {
    "id": "5",
    "listId": "1",
    "name": "Castro Valley"
  },
  {
    "id": "6",
    "listId": "2",
    "name": "Hayward"
  },
  {
    "id": "7",
    "listId": "4",
    "name": "San Jose"
  },
  {
    "id": "8",
    "listId": "4",
    "name": "Cupertino"
  },
  {
    "id": "9",
    "listId": "3",
    "name": "Stanford"
  },
  {
    "id": "10",
    "listId": "2",
    "name": "Oakland"
  }
]

const users = [
  { 
    "id": "1",
    "username": "Mike",
    "password": "pass123"
  },
  { 
    "id": "2",
    "username": "test",
    "password": "pass123"
  },
];

module.exports = { cities, lists, users }