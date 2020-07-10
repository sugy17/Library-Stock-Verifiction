drop database Employee;
create database Employee;
use Employee;


CREATE TABLE `employee_data` (
  `ID` varchar(30) PRIMARY KEY,
  `NAME` varchar(30) NOT NULL,
  `EMAIL` varchar(30) NOT NULL,
  `PROFILE` varchar(50) NOT NULL DEFAULT 'N',
  `NUMBER` int(10) NOT NULL,
  `PASSWORD` varchar(100) NOT NULL,
  `DESIGNATION` varchar(30) NOT NULL,
  `DOB` date NOT NULL
);

INSERT INTO `employee_data` (`ID`, `NAME`, `EMAIL`, `PROFILE`, `NUMBER`, `PASSWORD`, `DESIGNATION`, `DOB`) VALUES
('1CR17CS159', 'SURAJ', 'abcd@gmail.com', 'fileToUpload-1583322914691.jpg', 1234567890, '$2a$10$1TPVTyxXlOljs0u4CllzMuJ3KWbZGEK5D2Q4S/JkSLilNf/0DMUH2', 'publisher', '1997-12-05'),
('1CR17CS500', 'SURYA', 'kishor@gm', 'N', 0, '$2a$10$BXPlDK9dYJ2/e3D1/.qTVuio5J4LWxAVUwixhwVBaVpehqsemmeRO', 'admin', '2020-12-12');


CREATE TABLE `library_book` (
  `Access_No` varchar(20) PRIMARY KEY,
  `Title` varchar(50) NOT NULL,
  `Authors` varchar(30) NOT NULL,
  `Department` varchar(30) NOT NULL,
  `Rack_No` varchar(10) NOT NULL DEFAULT 'N/A',
  `Matching_Access_No` varchar(20) NOT NULL DEFAULT 'N/A'
);
