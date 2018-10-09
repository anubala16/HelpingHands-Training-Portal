create database if not exists collab_data;

use collab_data; 


DROP TABLE if exists Users;


CREATE TABLE Users (
userID     BIGINT AUTO_INCREMENT,
username   VARCHAR(25) NOT NULL,
fName      VARCHAR(20) NOT NULL,
lName      VARCHAR(25),
pwHash     VARCHAR(64),    -- sha512(pw + pwSalt)
pwSalt     VARCHAR(64),    -- random gen @ account creation?
streetAddr VARCHAR(50), 
city       VARCHAR(25), 
county     VARCHAR(30), 
locState   VARCHAR(20), 
email      VARCHAR(40), 
userLevel  VARCHAR(5), -- reg or admin 
PRIMARY KEY (userID)
);


#---------------------AUTO_INCREMENT_RESET----------------------------------------
ALTER TABLE Users AUTO_INCREMENT=100;

#------------------------INSERT STATEMENTS--------------------------
INSERT INTO Users(username, fName, lName, city, county, locState, userLevel) VALUES ('tsawyer', 'Tom', 'Sawyer', 'Raleigh', 'Wake', 'NC', 'admin'); 
INSERT INTO Users(username, fName, lName, city, county, locState, userLevel) VALUES ('aRobins', 'Alice', 'Robins', 'Charlotte', 'Charlotte-Mecklenburg', 'NC', 'reg'); 
INSERT INTO Users(username, fName, lName, city, county, locState, userLevel) VALUES ('sBerry25', 'Straw', 'Berry', 'Concord', 'Charlotte-Mecklenburg', 'NC', 'admin'); 

