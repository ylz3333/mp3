## FAQ

Here are some answers to some popular questions from previous years.

### Lost In The Sauce?

* Where do I begin? 

    > I'm really confused on how to start or what to do for MP3?
    
    __Answer__: Please start by watching the dev lab recordings, as they often provide instructions on how to approach the MPs. Additionally, going through the class slides and recordings can give you a better understanding of the concepts. Lastly, ensure you thoroughly read through the MP3 instructions, as they are designed to guide you through the assignment. If after doing all these, you still have questions, please don't hesitate to reach out for further clarification. If you did all of that and are still confused, please join the next available office hours.

* Next Steps After Setting up MongoDB Cluster?

    > Confused on how to start. I've set up the mongodb cluster and everything but I don't know what to do next.

    __Answer__: The next step is to get the connection string. If you've set up the MongoDB cluster, Click on "Connect" to get the connection string. The connection string typically looks like:

    `mongodb+srv://username:password@link/test?retryWrites=true`

    Replace <username> and <password> with your __database__ username and password. The database credentials are not the login details for your MongoDB Atlas account.

* Testing?

    > How to check if my code is correct? Just NPM start? What else should i do to check if my code can pass the tests?

    __Answer__: Once you implemented all 4 endpoints, you can use tools like Postman to manually test your API routes. Ensure that all endpoints return the expected response and status codes. Inspect the data in your database to ensure that the data gets stored, updated, and deleted as intended based on your API actions.

    > users/:id GET Respond with details of specified user or 404 error \
    > PUT Replace entire user with supplied user or 404 error \
    > DELETE Delete specified user or 404 error \
    > \
    > I just wonder how I can give and check GET PUT and DELETE requests for both users and tasks from using URLs. or is there any other way for doing this?

    __Answer__: If you are asking how to test these endpoints and read through the data you send in and receive, I would recommend using Postman! It provides a clean interface for making HTTP requests. Otherwise, look up the documentation for curl and have fun :D

### MongoDB Questions

1. MP3 Collection Constraints

    > In MP3, we will create two collections in our database, User and Task, and I notice there are some constraints. I wonder if we should enforce these constraints in the Schema defined by Mongoose, or we should enforce them in our backend server?

    __Answer__: "I wonder if we should enforce these constraints in the Schema defined by Mongoose" <-- this should be sufficient.

2. Mongoose timestamps

    > For the user and task schema, can we use the mongoose timestamps "createdAt" for the "dateCreated" field, or we have to manually create "dateCreated" filed and set accordingly.

    __Answer__: Yes, you can use Mongoose's built-in `timestamps`.

3. Deprecated URL Warning
    ```
    I am getting this error: 

    (node:72912) [DEP0170] DeprecationWarning: The URL mongodb://<"username">:<"password">@ac-awddrux-shard-00-00.1xcdsnq.mongodb.net:27017,ac-awddrux-shard-00-01.1xcdsnq.mongodb.net:27017,ac-awddrux-shard-00-02.1xcdsnq.mongodb.net:27017/test?authSource=admin&replicaSet=atlas-6tfpfd-shard-0&retryWrites=true&ssl=true is invalid. Future versions of Node.js will throw an error.
    (Use `node --trace-deprecation ...` to show where the warning was created)

    When I look at http://localhost:4000/api on postman I am getting the correct response so I am unsure what this error means and how to fix it. Do I need to worry about this or is it fine as long as the link works like expected?
    ```

    __Answer__: If possible, switch to the newer SRV-style connection string provided by MongoDB Atlas. It's shorter and often recommended for newer applications. It typically looks like this:
    
    `mongodb+srv://username:password@your-cluster.mongodb.net/database`


### MP3 Project Clarifications

1. .env
    > In the .env file, other than the MONGODB_URI key, do we need to update the TOKEN key or we just leave it as what it is?

    __Answer__: For the `.env` file, regarding the TOKEN key, you can leave it as it is. However, ensure that you have the correct value for MONGODB_URI to connect to your MongoDB instance. Be sure to add ".env" to your .gitignore to prevent it from being committed to version control/GitHub.

2. Using external packages
    
    > Are we allowed to install other packages, such as Morgan to monitor the request?

    __Answer__: Yes, you can install additional packages like Morgan if they help with development and debugging. However, always ensure that any additional packages or tools you use do not conflict with the primary requirements of the project.

3. Conflicting Inputs MP3

    > Do we have to check if there is a conflict of assignment between tasks and users. For example, a task and user are linked to each other, meaning that task’s assignedUser attribute has the user’s id and the user has the task id in its pending task. A new user is added with a pending task that has that task id(meaning that there is a conflict). If we have to check it, what is the appropriate response?

    __Answer__: Yes, it means two different users are being assigned the same task, which could lead to inconsistency. You should not allow the assignment to take place. "The task is already assigned to another user" with the appropriate HTTP status code could be a response.

4. 404 Clarification

    > users/:id GET Respond with details of specified user or 404 error \
    > \
    > When http://localhost:4000/api/users?where={"_id";: "55099652e5993a350458b7b7"} can't find a user, which do we give: 404 error message or {"message":"OK","data":[]} 

    __Answer__: Personally, I would do the latter, but for this assignment I think the 404 error is required.

5. Cascade Updates

    > Just for clarification when we are implementing PUT for Task or User do we have to make sure the other one gets updated as well. For example, if the User is updated with pendingTasks, does the Task have to update with the assigned userID and userName and the other way around?

    __Answer__: Yes, when implementing the PUT method for either Task or User, you need to ensure the two-way reference between Task and User is maintained.
    
    If you PUT a Task with an assignedUser and assignedUserName:
    * The corresponding User's pendingTasks should be updated to include this task.
    
    If you PUT a User with pendingTasks:
    * The tasks listed in pendingTasks should update their assignedUser and assignedUserName fields to reference this user.

    > I'm seeing a lot of conflicting information, and I wanted clarification on how to deal with the two-way reference with PUTS and DELETES. \
    >
    > SCENARIO: PUT request to /api/task/:id but the Task is already assigned to a User. \
    > \
    > Case 1: Should we AWLAYS overwrite the Task with the request body information (RESTFUL PUT), and update the necessary User and/or Task appropriately to keep the two-way reference? (e.g. remove Task from User.pendingTasks etc.) \
    > \
    > Case 2: Should we send an error status and not update anything, keeping the two-way reference (this may make it so that some Tasks can never be updated....) \
    > \
    > How should PUT /api/users/:id also behave in this scenario. Should we always overwite the User with the new request body information, and update other Users and Tasks accordingly, or should we just send an error status if there is conflicting information (request body information pendingTasks has a Task that's already assigned to someone, don't update anything with the current User and send an error status) \
    > \
    > Lastly, what should happen with /api/delete requests for both Users and Task? I am assuming with DELETE requests we should ALWAYS delete successfully (go through with the operation) unless the ID is not found (then 404), and update necessary Users and Tasks appropiately (e.g. remove user from Task if user is deleted). Or, should we not delete when there is conflicting information and send an error status...

    __Answer__: If a PUT request changes the assigned user, you should make the appropriate modifications to remain consistent and maintain two-way reference. 
    
    A DELETE request should always be carried out on a legitimate ID, and assigned tasks / assigned users should be removed or set to null accordingly to maintain consistency and two-way reference.

    ```
    If a new task is created or an existing task is updated, and if the completed field is set to true, is it considered as a pending task? Do we need to add this task to the assignedUser's pendingTasks list?
    ```

    __Answer__: No, if the completed field is set to true for a task, it should not be considered as a pending task. Therefore, when creating or updating a task with the completed field set to true, you should not add this task to the assignedUser's pendingTasks list.

7. Queries

    > "You will also need to make sure the select parameter works for the users/:id and tasks/:id endpoints.:" \
    > \
    > Does it mean we can have an API endpoint like this? \
    > \
    > http://localhost:4000/api/users/:1?where={"name": "web_prog"} \
    > \
    > Follow up questions what if userId 1 = "soemthing" and user with name "web_prog" has ID 5. What should we return in such case.

    __Answer__: Based on the requirements provided, when accessing the endpoints users/:id and tasks/:id, only the select parameter is required to function. All other parameters can be ignored for these specific endpoints. Thus, in the query:

    http://localhost:4000/api/users/:1?where={"name": "web_prog"}
    
    if someone is trying to access a specific user by ID, the ID should be the primary filter, and query parameters like where should not be applied. If the where parameter is provided in such a request, you can either ignore it or return an error.
    
    In the follow-up question, you should return the user with ID 1 since the:id filter is primary.

8. Error Handling
    ```
    In the mp instructions it is mentioned that:

    "Error responses from your API should also also be a JSON object with a message and data fields. Messages have to sensible and human readable so that on the client side it can be displayed to the user. Also, it should be independent of the server side technology that you are using. For example, your API should not return an error message directly from Mongoose to the client."

    "message" field should have some human readable string. What should the "data" field contain? Can it contain the actual error message?

    example:

    {
    "message": "Internal Server Error",
    "data": "Cast to ObjectId failed for value \"653b71db6097fe49e83f1e\" (type
    string) at path \"_id\" for model \"User\""
    }
    ```

    __Answer__: The "data" field can contain additional information regarding the error, but you should avoid sending detailed error messages, especially those generated directly from Mongoose. "Invalid ID format provided for User" could be an example.

    ```
    For users/:id and tasks/:id it is mentioned in the instructions to return 404 error in case the user or task is not found.

    If a valid _id is used in the query, but there is no user with that _id, then my API is returning 404 error:

    http://localhost:4000/api/users/:id 

    id - 653b71db6097fe49e83f1e94

    Status 404 Not Found

    {
    "message": "User Not Found",
    "data": "User not found."
    }
    But when I use some invalid _id like some random string, then I am getting this error:
    http://localhost:4000/api/users/:id
    id - fdsfdsfrwdsfc
    Status 500 Internal Server Error
    {
    "message": "Internal Server Error",
    "data": "Cast to ObjectId failed for value \"fdsfdsfrwdsfc\" (type string) at path \"_id\" for model \"User\""
    }
    How to deal with such cases? Should I return the above response or 404 response in case _id is invalid?
    ```

    __Answer__: If a valid _id is used in the query, but there is no user with that _id, then my API is returning 404 error: _This is the expected behavior_.
    
    How to deal with such cases? Should I return the above response or 404 response in case _id is invalid?

    Since this is an internal server issue and not a client's concern. It's better to return a 404 error in this case as well, indicating that the requested resource (based on the invalid _id) is not found.

### Submission Logistics

* Video Submission?

    > For MP3, do we submit a video along with the repo link? Asking to make surebecause I only see repo link and nothing else.

    __Answer__: No, you don't have to submit a video for MP3.

* MongoDB
    > Should we clean up and empty the database before making a submission?

    __Answer__: No, based on the requirements provided, you should not clean up and empty the database before making a submission. Instead, ensure that your MongoDB Atlas database contains at least 20 users and 100 tasks (with about half of them being completed) as specified.
