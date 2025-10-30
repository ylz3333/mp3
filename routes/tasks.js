var Task = require('../models/task');
var User = require('../models/user');

module.exports = function (router) {
    // GET /api/tasks - List all tasks with optional query parameters
    router.route('/tasks')
        .get(function (req, res) {
            var query = Task.find();
            
            // Handle 'where' parameter
            if (req.query.where) {
                try {
                    var whereFilter = JSON.parse(req.query.where);
                    query = query.find(whereFilter);
                } catch (e) {
                    return res.status(400).json({
                        message: "Invalid 'where' parameter",
                        data: "The 'where' parameter must be valid JSON"
                    });
                }
            }
            
            // Handle 'select' parameter
            if (req.query.select) {
                try {
                    var selectFilter = JSON.parse(req.query.select);
                    query = query.select(selectFilter);
                } catch (e) {
                    return res.status(400).json({
                        message: "Invalid 'select' parameter",
                        data: "The 'select' parameter must be valid JSON"
                    });
                }
            }
            
            // Handle 'sort' parameter
            if (req.query.sort) {
                try {
                    var sortFilter = JSON.parse(req.query.sort);
                    query = query.sort(sortFilter);
                } catch (e) {
                    return res.status(400).json({
                        message: "Invalid 'sort' parameter",
                        data: "The 'sort' parameter must be valid JSON"
                    });
                }
            }
            
            // Handle 'limit' parameter (default is 100 for tasks)
            if (req.query.limit) {
                query = query.limit(parseInt(req.query.limit));
            } else {
                query = query.limit(100);
            }
            
            // Handle 'skip' parameter
            if (req.query.skip) {
                query = query.skip(parseInt(req.query.skip));
            }
            
            // Handle 'count' parameter
            if (req.query.count && req.query.count.toLowerCase() === 'true') {
                query.countDocuments().exec()
                    .then(function (count) {
                        res.status(200).json({
                            message: "OK",
                            data: count
                        });
                    })
                    .catch(function (err) {
                        res.status(500).json({
                            message: "Internal Server Error",
                            data: "An error occurred while counting documents"
                        });
                    });
                return;
            }
            
            // Execute query
            query.exec()
                .then(function (tasks) {
                    res.status(200).json({
                        message: "OK",
                        data: tasks
                    });
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while retrieving tasks"
                    });
                });
        })
        
        // POST /api/tasks - Create a new task
        .post(function (req, res) {
            var task = new Task();
            task.name = req.body.name;
            task.description = req.body.description;
            task.deadline = req.body.deadline;
            if (req.body.completed !== undefined) task.completed = req.body.completed;
            if (req.body.assignedUser !== undefined) task.assignedUser = req.body.assignedUser;
            if (req.body.assignedUserName !== undefined) task.assignedUserName = req.body.assignedUserName;
            
            // Validation
            if (!task.name || !task.deadline) {
                return res.status(400).json({
                    message: "Bad Request",
                    data: "Name and deadline are required fields"
                });
            }
            
            // Convert deadline to Date if it's a string/timestamp
            if (typeof task.deadline === 'string' || typeof task.deadline === 'number') {
                task.deadline = new Date(task.deadline);
            }
            
            task.save()
                .then(function (newTask) {
                    // If task is assigned to a user and not completed, add to user's pendingTasks
                    if (newTask.assignedUser && !newTask.completed) {
                        return User.findById(newTask.assignedUser)
                            .then(function (user) {
                                if (user) {
                                    if (user.pendingTasks.indexOf(newTask._id.toString()) === -1) {
                                        user.pendingTasks.push(newTask._id.toString());
                                        return user.save();
                                    }
                                }
                                return Promise.resolve();
                            })
                            .then(function () {
                                return newTask;
                            });
                    }
                    return newTask;
                })
                .then(function (newTask) {
                    res.status(201).json({
                        message: "Created",
                        data: newTask
                    });
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while creating the task"
                    });
                });
        });
    
    // GET /api/tasks/:id - Get a specific task
    router.route('/tasks/:id')
        .get(function (req, res) {
            var query = Task.findById(req.params.id);
            
            // Handle 'select' parameter
            if (req.query.select) {
                try {
                    var selectFilter = JSON.parse(req.query.select);
                    query = query.select(selectFilter);
                } catch (e) {
                    return res.status(400).json({
                        message: "Invalid 'select' parameter",
                        data: "The 'select' parameter must be valid JSON"
                    });
                }
            }
            
            query.exec()
                .then(function (task) {
                    if (!task) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Task not found"
                        });
                    }
                    res.status(200).json({
                        message: "OK",
                        data: task
                    });
                })
                .catch(function (err) {
                    // Check if it's an invalid ID format
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid task ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while retrieving the task"
                    });
                });
        })
        
        // PUT /api/tasks/:id - Update a task
        .put(function (req, res) {
            Task.findById(req.params.id)
                .then(function (task) {
                    if (!task) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Task not found"
                        });
                    }
                    
                    var oldAssignedUser = task.assignedUser;
                    var newAssignedUser = req.body.assignedUser;
                    
                    // Update task fields
                    if (req.body.name !== undefined) task.name = req.body.name;
                    if (req.body.description !== undefined) task.description = req.body.description;
                    if (req.body.deadline !== undefined) task.deadline = req.body.deadline;
                    if (req.body.completed !== undefined) task.completed = req.body.completed;
                    if (req.body.assignedUser !== undefined) task.assignedUser = req.body.assignedUser;
                    if (req.body.assignedUserName !== undefined) task.assignedUserName = req.body.assignedUserName;
                    
                    // Validation
                    if (!task.name || !task.deadline) {
                        return res.status(400).json({
                            message: "Bad Request",
                            data: "Name and deadline are required fields"
                        });
                    }
                    
                    // Convert deadline to Date if it's a string/timestamp
                    if (typeof task.deadline === 'string' || typeof task.deadline === 'number') {
                        task.deadline = new Date(task.deadline);
                    }
                    
                    // Save task first
                    return task.save().then(function (updatedTask) {
                        // Handle two-way reference updates
                        var promises = [];
                        
                        // If assigned user changed, remove from old user's pendingTasks
                        if (oldAssignedUser && oldAssignedUser !== updatedTask.assignedUser) {
                            promises.push(
                                User.findById(oldAssignedUser).then(function (oldUser) {
                                    if (oldUser) {
                                        var index = oldUser.pendingTasks.indexOf(updatedTask._id.toString());
                                        if (index > -1) {
                                            oldUser.pendingTasks.splice(index, 1);
                                            return oldUser.save();
                                        }
                                    }
                                    return Promise.resolve();
                                })
                            );
                        }
                        
                        // Add to new user's pendingTasks if assigned and not completed
                        if (updatedTask.assignedUser && !updatedTask.completed) {
                            promises.push(
                                User.findById(updatedTask.assignedUser).then(function (newUser) {
                                    if (newUser && newUser.pendingTasks.indexOf(updatedTask._id.toString()) === -1) {
                                        newUser.pendingTasks.push(updatedTask._id.toString());
                                        return newUser.save();
                                    }
                                    return Promise.resolve();
                                })
                            );
                        }
                        
                        // If task became completed, remove from user's pendingTasks
                        if (updatedTask.completed && oldAssignedUser) {
                            promises.push(
                                User.findById(oldAssignedUser).then(function (user) {
                                    if (user) {
                                        var index = user.pendingTasks.indexOf(updatedTask._id.toString());
                                        if (index > -1) {
                                            user.pendingTasks.splice(index, 1);
                                            return user.save();
                                        }
                                    }
                                    return Promise.resolve();
                                })
                            );
                        }
                        
                        return Promise.all(promises).then(function () {
                            return updatedTask;
                        });
                    });
                })
                .then(function (updatedTask) {
                    res.status(200).json({
                        message: "OK",
                        data: updatedTask
                    });
                })
                .catch(function (err) {
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid task ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while updating the task"
                    });
                });
        })
        
        // DELETE /api/tasks/:id - Delete a task
        .delete(function (req, res) {
            Task.findById(req.params.id)
                .then(function (task) {
                    if (!task) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Task not found"
                        });
                    }
                    
                    // Remove task from assigned user's pendingTasks
                    if (task.assignedUser) {
                        return User.findById(task.assignedUser)
                            .then(function (user) {
                                if (user) {
                                    var index = user.pendingTasks.indexOf(task._id.toString());
                                    if (index > -1) {
                                        user.pendingTasks.splice(index, 1);
                                        return user.save();
                                    }
                                }
                                return Promise.resolve();
                            })
                            .then(function () {
                                return task.remove();
                            });
                    }
                    
                    return task.remove();
                })
                .then(function () {
                    res.status(204).send();
                })
                .catch(function (err) {
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid task ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while deleting the task"
                    });
                });
        });
    
    return router;
};

