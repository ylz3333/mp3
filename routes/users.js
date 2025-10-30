var User = require('../models/user');
var Task = require('../models/task');

module.exports = function (router) {
    // GET /api/users - List all users with optional query parameters
    router.route('/users')
        .get(function (req, res) {
            var query = User.find();
            
            // Handle 'where' parameter
            if (req.query.where) {
                try {
                    var whereFilter = JSON.parse(req.query.where);
                    query = User.find(whereFilter);
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
            
            // Handle 'limit' parameter
            if (req.query.limit) {
                query = query.limit(parseInt(req.query.limit));
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
                .then(function (users) {
                    res.status(200).json({
                        message: "OK",
                        data: users
                    });
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while retrieving users"
                    });
                });
        })
        
        // POST /api/users - Create a new user
        .post(function (req, res) {
            var user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            
            // Validation
            if (!user.name || !user.email) {
                return res.status(400).json({
                    message: "Bad Request",
                    data: "Name and email are required fields"
                });
            }
            
            user.save()
                .then(function (newUser) {
                    res.status(201).json({
                        message: "Created",
                        data: newUser
                    });
                })
                .catch(function (err) {
                    // Handle duplicate email error
                    if (err.code === 11000) {
                        return res.status(400).json({
                            message: "Bad Request",
                            data: "A user with this email already exists"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while creating the user"
                    });
                });
        });
    
    // GET /api/users/:id - Get a specific user
    router.route('/users/:id')
        .get(function (req, res) {
            var query = User.findById(req.params.id);
            
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
                .then(function (user) {
                    if (!user) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "User not found"
                        });
                    }
                    res.status(200).json({
                        message: "OK",
                        data: user
                    });
                })
                .catch(function (err) {
                    // Check if it's an invalid ID format
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid user ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while retrieving the user"
                    });
                });
        })
        
        // PUT /api/users/:id - Update a user
        .put(function (req, res) {
            User.findById(req.params.id)
                .then(function (user) {
                    if (!user) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "User not found"
                        });
                    }
                    
                    // Update user fields
                    if (req.body.name !== undefined) user.name = req.body.name;
                    if (req.body.email !== undefined) user.email = req.body.email;
                    if (req.body.pendingTasks !== undefined) user.pendingTasks = req.body.pendingTasks;
                    
                    // Validation
                    if (!user.name || !user.email) {
                        return res.status(400).json({
                            message: "Bad Request",
                            data: "Name and email are required fields"
                        });
                    }
                    
                    // Save user first
                    return user.save();
                })
                .then(function (updatedUser) {
                    // Now update tasks that are in pendingTasks
                    if (updatedUser.pendingTasks && updatedUser.pendingTasks.length > 0) {
                        return Task.updateMany(
                            { _id: { $in: updatedUser.pendingTasks } },
                            { 
                                $set: { 
                                    assignedUser: updatedUser._id.toString(),
                                    assignedUserName: updatedUser.name
                                }
                            }
                        ).then(function () {
                            return updatedUser;
                        });
                    }
                    return updatedUser;
                })
                .then(function (updatedUser) {
                    res.status(200).json({
                        message: "OK",
                        data: updatedUser
                    });
                })
                .catch(function (err) {
                    // Handle duplicate email error
                    if (err.code === 11000) {
                        return res.status(400).json({
                            message: "Bad Request",
                            data: "A user with this email already exists"
                        });
                    }
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid user ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while updating the user"
                    });
                });
        })
        
        // DELETE /api/users/:id - Delete a user
        .delete(function (req, res) {
            User.findById(req.params.id)
                .then(function (user) {
                    if (!user) {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "User not found"
                        });
                    }
                    
                    // Unassign all tasks assigned to this user
                    return Task.updateMany(
                        { assignedUser: user._id.toString() },
                        { 
                            $set: { 
                                assignedUser: "",
                                assignedUserName: "unassigned"
                            }
                        }
                    ).then(function () {
                        return user.remove();
                    });
                })
                .then(function () {
                    res.status(204).send();
                })
                .catch(function (err) {
                    if (err.name === 'CastError') {
                        return res.status(404).json({
                            message: "Not Found",
                            data: "Invalid user ID format"
                        });
                    }
                    res.status(500).json({
                        message: "Internal Server Error",
                        data: "An error occurred while deleting the user"
                    });
                });
        });
    
    return router;
};

