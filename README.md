# MP #3: APIed Piper
### Due: November 19th, 2024, 11:59PM CT

## Table of Contents
1. [Assignment](#1-assignment)
2. [Getting Started](#2-getting-started)
3. [Tips](#3-tips)
4. [Rules](#rules)
5. [Submission Details](#submission-details)

## 1. Assignment

**The Basic Goal** : Create an API for a task management / todo list.

**The Fun Goal** : Imagine your hot new startup, Llama.io, is creating the best todo webapp on the market. You're competing in a crowded space with hot players like Asana, Wunderlist, Google Keep, etc, so your API has to be top-notch.

#### Task

 Implement an API with the following end-points (they would be preceded by something like http://localhost:3000/api/). Your implementation should use Node, Express and Mongoose.


| Endpoints| Actions | Intended Outcome                                    |
|----------|---------|-----------------------------------------------------|
| users    | GET     | Respond with a List of users                        |
|          | POST    | Create a new user. Respond with details of new user |
| users/:id| GET     | Respond with details of specified user or 404 error |
|          | PUT     | Replace entire user with supplied user or 404 error |
|          | DELETE  | Delete specified user or 404 error                  |
| tasks    | GET     | Respond with a List of tasks                        |
|          | POST    | Create a new task. Respond with details of new task |
| tasks/:id| GET    | Respond with details of specified task or 404 error  |
|          | PUT     | Replace entire task with supplied task or 404 error |
|          | DELETE  | Delete specified task or 404 error                  |

**NOTE**: In addition, the API has the following JSON encoded query string parameters for the GET requests to the `users` and `tasks` endpoints. You will also need to make sure the [+select+] parameter works for the `users/:id` and `tasks/:id` endpoints.:

| Parameter | Description                                                                                  |
|----------|----------------------------------------------------------------------------------------------|
| where    | filter results based on JSON query                                                           |
| sort     | specify the order in which to sort each specified field  (1- ascending; -1 - descending)     |
| select   | specify the set of fields to include or exclude in each document  (1 - include; 0 - exclude) |
| skip     | specify the number of results to skip in the result set; useful for pagination               |
| limit    | specify the number of results to return (default should be 100 for tasks and unlimited for users)                    |
| count    | if set to true, return the count of documents that match the query (instead of the documents themselves)                    |

Here are some example queries and what they would return:

| Query                                                                                | Description                                             |
|-----------------------------------------------------------------------------------------|---------------------------------------------------------|
| `http://localhost:3000/api/tasks`                          | Returns full list of  tasks                       |
| `http://localhost:3000/api/users`                          | Returns full list of users                       |
| `http://localhost:3000/api/users?where={"_id": "55099652e5993a350458b7b7"}`         | Returns a list with a single user with the specified ID ('_id' will be different) |
| `http://localhost:3000/api/tasks?where={"completed": true}`                          | Returns a list of completed tasks                       |
| `http://localhost:3000/api/tasks?where={"_id": {"$in": ["59f930d6b1596b0cb3e82953","5a1b6d7bd72ba9106fe9239c"]}}` | Returns a set of tasks                                  |
| `http://localhost:3000/api/users?sort={"name": 1}`                                  | Returns a list of users sorted by name                  |
| `http://localhost:3000/api/users?select={"_id": 0}`                                  | Returns a list of users without the _id field           |
| `http://localhost:3000/api/tasks?skip=60&limit=20`                                   | Returns tasks number from 61 to 80                            |

**The API should be able to handle any combination of those parameters in a single request**. For example, the following is a valid GET request:

```javascript
http://localhost:3000/api/users?sort={"name": 1}&skip=60&limit=20
```

Here is the User Schema:

1. "name" - String
2. "email" - String
3. "pendingTasks" - [String] - The \_id fields of the *pending* tasks that this user has
4. "dateCreated" - Date - should be set automatically by server

Here is the Task Schema:

1. "name" - String
2. "description" - String
3. "deadline" - Date
4. "completed" - Boolean
5. "assignedUser" - String - The \_id field of the user this task is assigned to - default ""
6. "assignedUserName" - String - The name field of the user this task is assigned to - default "unassigned"
7. "dateCreated" - Date - should be set automatically by server to present date

**We assume that each task can be assigned only to one user.**

#### Requirements

1. Your database should be on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). It should contain at least 20 users and 100 tasks (about half of which should be completed) (**We provided scripts for you in the database_scripts folder. Read below how to use these scripts**). ***NOTE: Please add "Allow access from anywhere" to your cluster in the IP Whitelist"*** (This is usually not a good practice in real use. Here is just easier for us to grade your mp) 

2. Responses from your API should be a JSON object with two fields. The first field should be named `message` and should contain a human readable String. The second field should be named `data` and should contain the actual JSON response object. For example, here is a valid response:

```javascript
{
    "message": "OK",
    "data": {
        "_id": "55099652e5993a350458b7b7",
        "email": "khandek2@illinois.edu",
        "name": "Sujay Khandekar"
    }
}
```

3. Error responses from your API should also also be a JSON object with a `message` and `data` fields. Messages have to sensible and human readable so that on the client side it can be displayed to the user. Also, it should be independent of the server side technology that you are using. For example, your API should not return an error message directly from Mongoose to the client.

4. Your API should respond with appropriate [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html) for both successful and error responses. You should at least have the following codes: 200 (success), 201 (created), 204(no content), 400(bad request), 404 (not found), 500 (server error).

5. You should implement the query string functionality by using the methods provided by Mongoose (as opposed to querying Mongoose for all the results and then doing the filtering/sorting/skipping etc. in your Node/Express application code).

6. Have server side validation for:
    - Users cannot be created (or updated) without a name or email. All other fields that the user did not specify should be set to reasonable values.
    - Multiple users with the same email cannot exist.
    - Tasks cannot be created (or updated) without a name or a deadline. All other fields that the user did not specify should be set to reasonable values.

7. Your API should guarantee two-way reference between Task and User for the following methods:
    - PUT a Task with assignedUser and assignedUserName
    - DELETE a Task should remove the task from its assignedUser's pendingTasks
    - PUT a User with pendingTasks
    - DELETE a User should unassign the user's pending tasks

## 2. Getting Started
1. Create a public repository under your own account on GitHub by clicking the `use this template` button on the top right.
2. Clone the repository you created to your local machine.
3. Install dependencies:
`npm install`
4. Start the dev server:
`npm start`



## 3. Tips
  - Start early!
  - Please DO NOT delete the `.gitignore` file from the project, you will lose 1% point
  - DO NOT push your updated .env file to your repository (remember to uncomment .env in .gitignore), or you will lose 1% point
  - We will check if you uncommented .env
  - Check out [Postman](https://www.getpostman.com/postman) to your API
  - Free MongoDB server - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - The example queries above will cover 70% grade, and another 30% of corner test cases will not be released.
  - In order for us to view and grade your MP, you will be deploying your APIs on Render. Refer to DevLab videos and [slides](https://drive.google.com/file/d/1PGC0QUjd8cxOZyS4aFkj45g7QYOF5dWD/view?usp=sharing) for a demo including setting up MongoDB, connecting Express.js and deploying on Render.


For answers to some popular questions see [FAQ.md](./FAQ.md).

### How to use the DB Scripts

Assuming your API is fully operational (you need to have implement /users and /tasks endpoints for your API), these scripts (in database_scripts/ folder) will populate and clear your database as needed. 
***NOTE: Use Python3 to run following codes*** 

**dbClean.py**

`python3 dbClean.py -u "localhost" -p 3000 `

You can change "localhost" and the port number to match your own running api server. Leave the quotation marks. DO NOT include "/api/" or "/user" etc.

**dbFill.py**

`python3 dbFill.py -u "localhost" -p 3000 -n 20 -t 100`

Once again, change the url and port number to match your own running api server. You can populate your database with X users and Y tasks (in the above case, 20 and 100 respectively). This will randomly generate users with realistic names and emails as well as realistic tasks. Tasks will have a 50% chance of being completed and a 60% chance of being assigned. If num_tasks >> num_users, users will likely have multiple tasks assigned to them. A task will have one assigned user at most.

**task.txt**

Contains sample task descriptions. Edit if you want, I don't care.  

## Rules
1. This is an individual assignment. No collaboration is permitted.
2. It is not permitted to copy/paste code that is not your own. You are, however, free to look at different code sources for inspiration and clarity. All sources (code as well as reading material) that you reference to complete this assignment must be declared in the submission.
3. If you think something you’re doing might not be acceptable, please ask on Piazza.

## Submission Details
Fill out and submit the form [Submission Form](https://forms.gle/m6F1Gg5bcg2xn1HJA)

## Large Language Model Usage Policy

We acknowledge the transformative potential of Large Language Models (LLM) in generating code; however, we are still in the nascent stages of understanding how to embed LLMs in developer workflows to write code more efficiently while maintaining quality. Therefore, we will not be teaching students directly how to use LLMs to develop web applications.

As part of this class, we *do* encourage students to experiment with LLM services such as OpenAI's ChatGPT to generate source code for MPs. If LLMs are used to generate code for an MP, students *must* (1) submit their chatlogs along with their source code, and (2) answer survey questions related to their experience using LLMs in the grading form. Failure to do this will be a violation of the academic integrity policy of this course.
