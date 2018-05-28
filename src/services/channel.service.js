"use strict";

const Database = require("../adapters/Database");
const Models = require("../models");
const { MoleculerError } = require("moleculer").Errors;
const uuidv4 = require('uuid/v4');

module.exports = {
	name: "channel",

	settings: {
 		state: {

 		}
	},

	actions: {

		create: {
			params: {
				
				id_user: "string",
				firstname: "string",
				lastname: "string"
			},
			handler(ctx) {
				var chan = new Models.Channel(ctx.params).create();

				if (chan) {
					return Database()
						.then((db) => {
                            var allChan = db.get("channel");
                            
                            if(allChan.find({ "id_user": chan.id_user }).value()) {
								throw new MoleculerError("users", 401, "ERR_CRITICAL", { code: 401, message: "Channel already exists."} )
							}

							return allChan
								.push(chan)
								.write()
								.then(() => {
									return chan;
								})
								.catch(() => {
									throw new MoleculerError("message", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
								});
					});
				} else {
					throw new MoleculerError("message", 417, "ERR_CRITICAL", { code: 417, message: "message is not valid." } )
				}
			}
        },
        
        
		getChannel: {
			params: {
				id_user: "string"
			},
			handler(ctx) {
				return ctx.call("channel.verify", { id_user: ctx.params.id_user })
				.then((exists) => {
					if (exists) {
                        return ctx.call("channel.verifyAdmin", { id_user: ctx.params.id_user })
                        .then((exists) => {
                            if (exists) {
                                return Database()
                                .then((db) => {
                                    var chan = db.get("channel")
                                                .value();
                                    return chan;
                                })
                                .catch(() => {
                                    throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
                                });

                                
                            } else {
                                return Database()
                                .then((db) => {
                                    
                                    var theChan = db.get("channel")
                                                        .filter({ "id_user": ctx.params.id_user })
                                                        .value();
                                    return theChan;

                                })                                
                            }
                        })
						
					} else {
                        throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "Channel doesn't exist." } )
					}
				})
			}
        },
        

        getMessage: {
			params: {
				id_channel: "string"
			},
			handler(ctx) {
				return ctx.call("channel.verifyChannel", { id_channel: ctx.params.id_channel })
				.then((exists) => {
					if (exists) {
						return Database()
							.then((db) => {
                                var msg = db.get("channel")
                                                     .find({ "id": ctx.params.id_channel })
                                                     .get("messages")
                                                     .value();
								return msg;
							})
							.catch(() => {
								throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "Channel not found." } )
					}
				})
			}
		},
		
		
        

        postMessage: {
			params: {
                id_channel: "string",
				id_user: "string",
				message: "string"
			},
			handler(ctx) {
				var msg = new Models.Message(ctx.params).create();

				return ctx.call("channel.get", { id_user: ctx.params.id_user })
						.then((db_message) => {

							console.log(db_message);
		                           
							msg.firstname = db_message.firstname;
							msg.lastname = db_message.lastname;


							return Database()
								.then((db) => {
									return db.get("channel")
                                        .find({ id: ctx.params.id_channel })
                                        .get("messages")
										.push(msg)
										.write()
										.then(() => {
											return "inserted";
										})
										.catch(() => {
											throw new MoleculerError("orders", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								});




                        });
			}
		},

		get: {
			params: {
				id_user: "string"
			},
			handler(ctx) {
				return ctx.call("channel.verifyUser", { id_user: ctx.params.id_user })
				.then((exists) => {
					if (exists) {
						return Database()
							.then((db) => {
								var user = db.get("users")
												.find({ id: ctx.params.id_user })
												.value();
								return user;
							})
							.catch(() => {
								throw new MoleculerError("users", 500, "ERR_CRITICAL", { code: 500, message: "Critical error." } )
							});
					} else {
						throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "User doesn't exist." } )
					}
				})
			}
		},

		verifyUser: {
			params: {
				id_user: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("users")
										.filter({ id: ctx.params.id_user })
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},

		edit: {
			params: {
				id: "string",
				id_message: "string",
				message: "string"
			},
			handler(ctx) {
				return ctx.call("channel.verifyMessage", { id_channel: ctx.params.id, id_message: ctx.params.id_message })
				.then((exists) => {
					if (exists) {
						return ctx.call("channel.getMessage", { id_channel: ctx.params.id })
						.then((db_message) => {
							

							var msg = new Models.Message(db_message.messages[0]).create();
                            
							msg.id = ctx.params.id_message;
							msg.id_user = db_message.messages[0].id_user;
							msg.message = ctx.params.message;
							msg.firstname = db_message.messages[0].firstname;
							msg.lastname = db_message.messages[0].lastname;

							return Database()
								.then((db) => {
									return db.get("channel")
                                        .find({ id: ctx.params.id })
										.get("messages")
										.find({ id: ctx.params.id_message})
										.assign(msg)
										.write()
										.then(() => {
											return "updated";
										})
										.catch(() => {
											throw new MoleculerError("orders", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								});
						});
					} else {
						throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "Message not found." } )
					}
				})


			}
		},

		delete: {
			params: {
				id: "string",
				id_message: "string"
			},
			handler(ctx) {
				return ctx.call("channel.verifyMessage", { id_channel: ctx.params.id, id_message: ctx.params.id_message })
				.then((exists) => {
					if (exists) {
						return Database()
								.then((db) => {
									return db.get("channel")
                                        .find({ id: ctx.params.id })
										.get("messages")
										.unset({ id: ctx.params.id_message})
										.write()
										.then(() => {
											return "deleted";
										})
										.catch(() => {
											throw new MoleculerError("orders", 500, "ERR_CRITICAL", { code: 500, message: "Critical Error." } )
										});
								});
					} else {
						throw new MoleculerError("users", 404, "ERR_CRITICAL", { code: 404, message: "Message not found." } )
					}
				})


			}
		},



		verify: {
			params: {
				id_user: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("users")
										.filter({ id: ctx.params.id_user})
										.value();
						return value.length > 0 ? true : false;
					})
			}
        },

        verifyAdmin: {
			params: {
				id_user: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("users")
										.filter({ id: ctx.params.id_user, isAdmin: true})
										.value();
						return value.length > 0 ? true : false;
					})
			}
        },

        verifyChannel: {
			params: {
				id_channel: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("channel")
										.filter({ id: ctx.params.id_channel})
										.value();
						return value.length > 0 ? true : false;
					})
			}
		},
		
		verifyMessage: {
			params: {
				id_channel: "string",
				id_message: "string"
			},
			handler(ctx) {
				return Database()
					.then((db) => {
						var value = db.get("channel")
										.find({ id: ctx.params.id_channel})
										.get("messages")
										.filter({id: ctx.params.id_message})
										.value();
						return value.length > 0 ? true : false;
					})
			}
        },
        

	}
};

