-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 07, 2026 at 05:46 PM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u292462256_cart_cover`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `cloudinaryId` varchar(255) DEFAULT NULL,
  `isAccess` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  `isAdmin` tinyint(1) NOT NULL DEFAULT 1,
  `isSuper` tinyint(1) NOT NULL DEFAULT 0,
  `profilePicture` text DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `fullName`, `email`, `password`, `createdAt`, `cloudinaryId`, `isAccess`, `isAdmin`, `isSuper`, `profilePicture`, `updatedAt`, `isActive`) VALUES
(1, 'elipse', 'elipse@gmail.com', '$2a$12$wQR.GW2cyD/HnGbYkDSlyOruhh.OVFhYLFxoorH5fdf62xS11js7S', '2025-12-19 12:49:05', NULL, 'LOW', 1, 1, NULL, '2026-09-05 10:49:43.119', 1),
(2, 'SPrehoda', 'sprehoda@clubpromfg.com', '$2b$10$D5QiEwJp8YHPiFtFcBPS2Of4Zx8BGQzBxhG9wP9MTCgcK7juGXRxi', '2025-12-23 21:38:57', NULL, 'HIGH', 1, 0, NULL, '2025-12-23 21:38:57.959', 1),
(3, 'Bryan Casey', 'bryanc@clubpro.com', '$2b$10$Hja2zLo.EfQVzYi/3q6Kk.8XDc8p1U2JyMNrr0qu2BJg0g3MBj2z6', '2026-01-19 15:30:44', NULL, 'HIGH', 1, 0, NULL, '2026-01-19 15:30:44.258', 1),
(4, 'Ed Mangeri', 'ed@clubpromfg.com', '$2b$10$P7uAB3I2Wqk6O4yEeYRQHOcz2SYBAuVt5QOgcTv02lwPSoar/C7uC', '2026-01-19 15:31:24', NULL, 'HIGH', 1, 0, NULL, '2026-01-19 15:31:24.370', 1),
(5, 'Vin Romeo', 'vromeo@clubpro.com', '$2b$10$gMli8aAq7yHxdzvP8eLs8OWZe8HCn.x.zmQgd/qXL2QU6is4ib8OK', '2026-01-19 15:32:21', NULL, 'HIGH', 1, 0, NULL, '2026-01-19 15:32:21.884', 1),
(6, 'Brian Bianco', 'brianb@clubpromfg.com', '$2b$10$bjd2HCrsAzmNmReWDAKi..GN8MoIc/FAEt.2bjPYzd8on/FLeAZ4a', '2026-01-19 15:34:19', NULL, 'HIGH', 1, 0, NULL, '2026-01-19 15:34:19.196', 1),
(7, 'mani', 'mani@gmail.com', '$2b$10$WU.kMEgudEZnu.JI/mj/Pu.y0dx/olZHDHBXt46sOO0Ld7mtqasqO', '2026-02-10 15:53:41', NULL, 'LOW', 1, 0, NULL, '2026-02-10 15:53:41.024', 1),
(8, 'yaman', 'yaman@gmail.com', '$2b$10$GKow1lEnj.QC6G8ORtPl4uXGmuFx0Vzk3HZasxGGgoPMt.ZKW6haa', '2026-02-10 16:05:48', NULL, 'HIGH', 1, 0, NULL, '2026-02-10 16:05:48.024', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Brand`
--

CREATE TABLE `Brand` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `path` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `seoDescription` text DEFAULT NULL,
  `seoKeywords` text DEFAULT NULL,
  `seoTitle` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `imgAlt` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Brand`
--

INSERT INTO `Brand` (`id`, `name`, `createdAt`, `updatedAt`, `path`, `logo`, `seoDescription`, `seoKeywords`, `seoTitle`, `slug`, `imgAlt`) VALUES
(1, 'ClubCar', '2025-12-19 11:33:09.483', '2026-03-26 14:54:44.956', '/brand/ClubCar', '/uploads/brands/1768839943891-175876788.webp', '', '', '', 'ClubCar', NULL),
(2, 'ClubPro', '2025-12-19 11:33:09.483', '2026-03-26 14:55:39.531', '/brand/ClubPro', '/uploads/brands/1768839929930-291864554.webp', '', '', '', 'ClubPro', NULL),
(3, 'E-Z-GO', '2025-12-19 11:33:09.483', '2026-03-26 15:28:25.937', '/brand/E-Z-GO', '/uploads/brands/1768835437011-688043531.jpg', '', '', '', 'E-Z-GO', NULL),
(4, 'Yamaha', '2025-12-19 11:33:09.483', '2026-03-26 14:56:40.389', '/brand/Yamaha', '/uploads/brands/1768839891446-40678117.webp', '', '', '', 'Yamaha', NULL),
(9, 'Utility', '2025-12-23 20:19:09.219', '2026-05-14 17:22:46.818', '/brand/utility', '/uploads/brands/1778779366813-87870800.png', '', '', '', 'utility', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `billingCity` varchar(191) NOT NULL,
  `billingCountry` varchar(191) NOT NULL,
  `billingState` varchar(191) NOT NULL,
  `billingStreet` varchar(191) NOT NULL,
  `billingZip` varchar(191) NOT NULL,
  `commercialCity` varchar(191) NOT NULL,
  `commercialCountry` varchar(191) NOT NULL,
  `commercialState` varchar(191) NOT NULL,
  `commercialStreet` varchar(191) NOT NULL,
  `commercialZip` varchar(191) NOT NULL,
  `fishbowlCustomerNumber` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `fullName`, `email`, `password`, `createdAt`, `updatedAt`, `isActive`, `billingCity`, `billingCountry`, `billingState`, `billingStreet`, `billingZip`, `commercialCity`, `commercialCountry`, `commercialState`, `commercialStreet`, `commercialZip`, `fishbowlCustomerNumber`) VALUES
(19, 'elipse', 'elipse@gmail.com', '$2b$10$GEap4p78jufLG1Jd6nYi3esW.qtB8mXSFd6L6AswBXjS4ntnUzVDS', '2026-01-05 11:20:08', '2026-01-05 11:20:08.469', 1, 'Dolor numquam maiore', 'Iste voluptates sit', 'Non officiis quae ut', 'Quia velit eaque co', '71334', 'Velit sint excepteur', 'Fugit et quibusdam', 'Sit harum molestias', 'Cupidatat quia fugit', '30530', NULL),
(22, 'Rashad Mcfadden', 'gigisuju@mailinator.com', '$2b$10$CG70MiflgemKFW9icYURK.U6uHKUwn1l3hg0bsfH3fkKSsVttSKR.', '2026-01-05 15:30:53', '2026-01-05 15:30:53.794', 1, 'Porro qui quibusdam', 'Autem maxime earum s', 'Nemo voluptas volupt', 'Voluptas nostrud con', '94926', 'Eos quod in aute sed', 'Ullam doloribus esse', 'Possimus ut molesti', 'Numquam voluptates p', '44722', NULL),
(24, 'Muhammad Ahmed Zaki', 'mahmedzaki670@gmail.com', '$2b$12$aZiLP2z50JZgQWYu471QpeugJiCdHHICy.i5wGHwRLfasBkHdNJsC', '2026-01-14 17:50:41', '2026-01-15 19:35:56.753', 1, 'New York', 'US', 'NY', '456 Sample Avenue', '10001', 'New York', 'US', 'NY', '456 Sample Avenue', '10001', NULL),
(25, 'Steven Prehoda', 'sprehoda@gmail.com', '$2b$10$AQX88FQWrnsI4YifZdE/XuhutXa6ulqxYNbcRtzk2bSrYhbh8bIZq', '2026-01-14 18:50:01', '2026-01-19 16:52:07.429', 1, 'WADSWORTH', 'US', 'Ohio', '261 Seville Road', '44281', 'WADSWORTH', 'US', 'Ohio', '261 Seville Road', '44281', NULL),
(32, 'Paki Chen', 'ur3033213@gmail.com', '$2b$10$tLAPdLdn9CGXrooSIJ/RAunugTc7E.am43.kAyd9qNc0rBzLhpe2u', '2026-01-19 16:41:00', '2026-01-19 16:41:00.348', 1, 'Non perferendis anim', 'MX', 'Et neque ipsum quo s', 'Sed ut et deleniti q', '57405', 'Magnam et ex saepe c', 'US', 'Ea et cum hic maxime', 'Omnis quidem tempori', '25265', NULL),
(37, 'steve', 'steve@gmail.com', '$2b$10$Ob5akhTZEyDDEhNgn6JhRu6sbjvJlqFxyBsyi3Vtixz9L9uLRYsei', '2026-01-19 17:02:13', '2026-01-19 17:02:13.999', 1, 'Fugiat vel deleniti', 'Quod iusto sint exe', 'Dolore esse est aspe', 'Doloremque doloremqu', '60537', 'Sed facilis sed ea v', 'Dolor facilis id non', 'Ea molestiae nostrum', 'Deleniti est volupt', '12355', NULL),
(38, 'Abdul Ahad', 'abdulahad010274@gmail.com', '$2b$10$jjNk.kCL92L9KwPtWu6DFOP28ABktSP2vl4z8697ROguQNGweTSj.', '2026-01-20 10:55:33', '2026-01-20 10:55:33.800', 1, 'Karachi', 'US', 'Dolore sint ut conse', 'Block 10, Gulistan-e-Johar,', '07599', 'Karachi', 'CA', 'Tenetur reiciendis s', 'Block 10, Gulistan-e-Johar,', '07599', NULL),
(39, 'Zeeshan Phekooo', 'muhammadzeeshan182004@gmail.com', '$2b$10$HSD1IORzE//KS42xtz4vRu7HRc9CEK9rcKvb9AGjGq6S2ze1.3.ES', '2026-01-21 18:42:37', '2026-01-21 18:42:37.634', 1, 'Corporis nihil ipsam', 'MX', 'Qui voluptatibus con', 'Hic ad sapiente corp', '12190', 'Labore laboriosam e', 'MX', 'Aliquip id est dist', 'Illum cupiditate pe', '88051', NULL),
(40, 'yamanaamir', 'yamanaamir2004@gmail.com', '$2b$10$CsSmbdI3R4oesCpZLJbva.oKRtJjPDbPCk/EWPJ/rxBodaJIqBn4.', '2026-02-03 13:38:33', '2026-05-05 14:59:08.878', 1, 'In qui maiores eum e', 'CA', 'Aute amet enim aspe', 'Magnam asperiores al', '93545', 'Adipisci dolor at al', 'US', 'Lorem at nostrud ull', 'In dolorem corporis ', '18979', NULL),
(41, 'yaman aamir', 'yamanaamir.dev@gmail.com', '$2b$10$d8Upyx0/C35/JdsyY5ih8OrbQsx6bHLNEBZLXayODP7IQriAs3sFq', '2026-05-05 10:08:40', '2026-05-05 11:51:42.925', 1, 'karachi', 'US', 'sindh', 'abc', '74400', 'abc', 'US', 'bac', 'abc', 'sdsdsdsdsd', NULL),
(42, 'Jade Hopper', 'syedabdul64@gmail.com', '$2b$10$UwQiUmFjb6VgGvl6QjGMI.qnSVWoORID2Rv/64XpqGSncrS/SmeJu', '2026-05-05 12:04:32', '2026-05-05 12:04:32.308', 1, 'Quis omnis sed sunt ', 'US', 'Repudiandae incidunt', 'Tempora eligendi fac', '42198', 'Facilis praesentium ', 'CA', 'Voluptas voluptatem', 'Aspernatur expedita ', '93638', NULL),
(43, 'Ariana Hurst', 'syedabdula64@gmail.com', '$2b$10$BD3/vxwgfAr4wnoktGYIf.26ml7bC/PrUrfQokGOzVMuV0hZ7/LQG', '2026-05-05 12:26:29', '2026-05-05 12:26:29.011', 1, 'Quia tempora non id', 'MX', 'Ut ut nihil consequa', 'Qui ut magna sapient', '73782', 'In modi expedita aut', 'MX', 'Repellendus In aut ', 'Quidem ea ad sit seq', '63613', NULL),
(44, 'Charde Franks', 'yamanaaamir2004@gmail.com', '$2b$10$m55HByI2KeQxur5D1ERvbuIQJkW6EA4tt362JTatYJxSLG3DU7iO2', '2026-05-05 15:40:58', '2026-08-19 13:30:05.474', 1, 'Voluptate error ut o', 'CA', 'Fuga Ut voluptate n', 'Earum inventore eius', '52408', 'Qui libero assumenda', 'US', 'Consequat Maxime qu', 'Eveniet labore aut ', '91243', NULL),
(45, 'Steven Prehoda', 'sprehoda@clubpromfg.com', '$2b$10$iJGqc36kWJHWFWH1.QoCxe589/rN//N2VDJyLXn7NQ7VxS.O7VacS', '2026-06-16 13:28:48', '2026-06-16 13:28:48.307', 1, 'Deer Park', 'United States', 'NY', '10 Lucon Dr', '11729', 'Deer Park', 'United States', 'NY', '10 Lucon Dr', '11729', NULL),
(46, 'Vin Romeo', 'vromeo@clubpro.com', '$2b$10$brg8D3x48tz8Nm2PyFR2.uaxgos6FD29aWTNnHMKmPxfSDQkARsly', '2026-06-16 20:33:57', '2026-06-16 20:33:57.861', 1, 'deer park', 'United States', 'New York', '10 lucon drive', '11729', 'deer park', 'United Staes', 'New York', '10 lucon drive', '11729', NULL),
(47, 'Brett Ernst', 'brett@rangeendgolfclub.com', '$2b$10$ZrGIDPIBtHI7oIkZ1GmDCu5LHAcOmY719B/4cXYdaF0/qQa4qc0I2', '2026-08-30 19:26:21', '2026-08-30 19:26:21.745', 0, 'DILLSBURG', 'US', 'PA', '303 Golf Club Avenue', '17019-1548', 'DILLSBURG', 'US', 'PA', '303 Golf Club Avenue', '17019-1548', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `DealerRegistration`
--

CREATE TABLE `DealerRegistration` (
  `id` int(11) NOT NULL,
  `companyName` varchar(191) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `mobile` varchar(191) DEFAULT NULL,
  `fax` varchar(191) DEFAULT NULL,
  `billingStreet` varchar(191) NOT NULL,
  `billingCity` varchar(191) NOT NULL,
  `billingState` varchar(191) NOT NULL,
  `billingZip` varchar(191) NOT NULL,
  `billingCountry` varchar(191) NOT NULL,
  `commercialStreet` varchar(191) NOT NULL,
  `commercialCity` varchar(191) NOT NULL,
  `commercialState` varchar(191) NOT NULL,
  `commercialZip` varchar(191) NOT NULL,
  `commercialCountry` varchar(191) NOT NULL,
  `hasShowroom` varchar(191) NOT NULL,
  `interestedBrands` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`interestedBrands`)),
  `sellBrands` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sellBrands`)),
  `authorizedDealer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`authorizedDealer`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isApproved` tinyint(1) DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `authorizedDealersOther` varchar(191) DEFAULT NULL,
  `resaleCertificate` varchar(191) DEFAULT NULL,
  `sellBrandsOther` varchar(191) DEFAULT NULL,
  `EIN` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DealerRegistration`
--

INSERT INTO `DealerRegistration` (`id`, `companyName`, `title`, `firstName`, `lastName`, `email`, `phone`, `mobile`, `fax`, `billingStreet`, `billingCity`, `billingState`, `billingZip`, `billingCountry`, `commercialStreet`, `commercialCity`, `commercialState`, `commercialZip`, `commercialCountry`, `hasShowroom`, `interestedBrands`, `sellBrands`, `authorizedDealer`, `createdAt`, `isApproved`, `status`, `authorizedDealersOther`, `resaleCertificate`, `sellBrandsOther`, `EIN`) VALUES
(32, 'Rivera and Rush Inc', 'Reprehenderit et et', 'Vielka', 'Bennett', 'kezyxif@mailinator.com', '+1 (209) 966-8722', '+1 (461) 829-1708', '+1 (871) 424-5146', 'Quo porro quis conse', 'Voluptatem Ad venia', 'In quibusdam occaeca', '51618', 'MX', 'Sed ipsa reprehende', 'Molestias ex asperio', 'Consequatur exceptu', '39034', 'CA', 'no', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-14 11:01:00.532', 0, 'pending', 'dfgdf', NULL, '', ''),
(33, 'Kane and Woodard Associates', 'Fugit explicabo Ut', 'Iliana', 'Salazar', 'mupelato@mailinator.com', '+1 (644) 477-2618', '+1 (731) 716-7433', '+1 (302) 454-6115', 'Natus eius voluptate', 'Adipisci laudantium', 'Non esse quae quasi', '13318', 'US', 'Reprehenderit odio ', 'Nam minima nostrud c', 'Consequatur Perspic', '72892', 'MX', 'yes', '[\"Outfit My Fleet Lease Program\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Other\"]', '[\"Polaris\",\"Honda\",\"Kawasaki\",\"Umax\"]', '2026-01-14 17:01:24.658', 0, 'pending', '', 'https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/brands/1768410084356-1%20%281%29.png', '', ''),
(37, 'Chang Gay Plc', 'Cumque ut corporis v', 'Muhammad Ahmed', 'Zaki', 'mahmedzaki670@gmail.com', '03462470860', '+1 (611) 271-2115', '+1 (174) 832-7855', '456 Sample Avenue', 'New York', 'NY', '10001', 'US', '456 Sample Avenue', 'New York', 'NY', '10001', 'US', 'yes', '[\"Outfit My Fleet Lease Program\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Other\"]', '[\"Polaris\",\"Can-Am\",\"Honda\",\"Kawasaki\",\"Carry-All\",\"Other\"]', '2026-01-14 17:50:12.985', 1, 'approved', '', 'https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/brands/1768413012686-1%20%281%29.png', '', ''),
(38, 'Johnson and Gibson Co', 'Sed sint quidem Nam ', 'Tara', 'Osborn', 'bumozivyt@mailinator.com', '+1 (115) 564-8372', '+1 (237) 678-7426', '+1 (943) 455-3041', 'Facere reprehenderit', 'Reiciendis id sit e', 'Labore voluptatem m', '92280', 'US', 'Sit nihil dolor irur', 'Facilis ipsa sit n', 'Dolorum dolore in op', '19868', 'MX', 'no', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-14 18:29:12.844', 0, 'pending', '', NULL, '', ''),
(39, 'fajad', 'fajad', 'Fahad', 'Nadeem', 'fahadnadeem@gmail.com', '03354721216', '03354721216', '', 'smtp.hostinger.com', 'karachi', 'asdasd', '343243', 'US', 'smtp.hostinger.com', 'karachi', 'karachi', '343243', 'US', 'yes', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Custom Orders\",\"Maintenance/Utility\"]', '[\"Club Car\",\"E-Z-GO\"]', '[\"Can-Am\"]', '2026-01-14 18:31:11.944', 0, 'pending', '', NULL, '', ''),
(40, 'J&O Plastics', '', 'SALENA', 'ZAK', 'sprehoda@gmail.com', '3309273169', '', '', '261 Seville Road', 'WADSWORTH', 'Ohio', '44281', 'US', '261 Seville Road', 'WADSWORTH', 'Ohio', '44281', 'US', 'no', '[\"Outfit My Fleet Lease Program\",\"Custom Orders\"]', '[\"Other\"]', '[\"Other\"]', '2026-01-14 18:33:17.414', 1, 'approved', '2', NULL, '1', ''),
(42, 'fajad', 'asd', 'Fahad', 'Nadeem', 'fahadnadesem@gmail.com', '03354721216', '03354721216', '', 'smtp.hostinger.com', 'karachi', 'asdasd', '343243', 'US', 'smtp.hostinger.com', 'karachi', 'karachi', '343243', 'US', 'yes', '[]', '[\"Club Car\"]', '[\"Other\"]', '2026-01-14 18:33:52.874', 0, 'pending', 'asd', 'https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/brands/1768415632777-8442af9a-0214-44c3-acf1-e065bd2c2c9f.jpg', '', ''),
(43, 'Terry and Hines Associates', 'Molestias mollitia v', 'Ahmed', 'Sweeney', 'pasevu@mailinator.com', '+1 (668) 123-5414', '+1 (351) 591-4557', '+1 (768) 192-5055', 'Veritatis totam ipsa', 'Qui ipsum consequatu', 'Suscipit laborum Na', '54731', 'US', 'Quo hic ipsam tempor', 'Error eum non earum ', 'Numquam incidunt im', '56868', 'MX', 'yes', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-14 18:37:04.477', 0, 'pending', '', 'https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/brands/1768415824064-admin.pdf', '', ''),
(45, 'fajad', '', 'Fahad', 'Nadeem', 'fahadnadasdeem@gmail.com', '03354721216', '', '', 'smtp.hostinger.com', 'karachi', 'asdasd', '343243', 'US', 'smtp.hostinger.com', 'karachi', 'karachi', '343243', 'US', 'yes', '[]', '[]', '[]', '2026-01-14 18:37:30.496', 0, 'pending', '', 'https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/brands/1768415850400-3b170e66-d388-4b46-962e-2eb98b0b7c56.pdf', '', ''),
(46, 'fajad', '', 'Fahad', 'Nadeem', 'fahadnadeasdasdem@gmail.com', '03354721216', '', '', 'smtp.hostinger.com', 'karachi', 'asdasd', '343243', 'US', 'smtp.hostinger.com', 'karachi', 'karachi', '343243', 'US', 'no', '[\"Soft-good Accessories\"]', '[]', '[]', '2026-01-14 18:37:53.628', 1, 'pending', '', NULL, '', ''),
(47, 'club pro manufacturing', 'Owner', 'steven', 'prehoda', 'sprehoda@clubpromfg.com', '5167295992', '5167295992', '', '10 Lucon Drive', 'deer park', 'NY', '11729', 'US', '10 lucon drive', 'deer park', 'New York', '11729', 'US', 'no', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\",\"Other\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-19 15:05:18.033', 0, 'pending', '', NULL, '', ''),
(52, 'Mcclain and Clay Trading', 'Corporis earum saepe', 'Patricia', 'Nunez', 'zumolubeve@mailinator.com', '+1 (857) 316-4344', '+1 (692) 652-3681', '+1 (786) 241-3832', 'Dolorem cupidatat ab', 'Fugit reprehenderit', 'Omnis quibusdam esse', '46023', 'CA', 'Voluptatem fugiat e', 'Nihil eum omnis sunt', 'Et laborum Mollit u', '50947', 'MX', 'no', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Hard-good Accessories\",\"Soft-good Accessories\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\",\"Other\"]', '[\"Polaris\",\"Can-Am\",\"Kawasaki\",\"Cushman\"]', '2026-01-19 15:47:35.812', 0, 'pending', '', NULL, 'sadsad', ''),
(53, 'Jones and Wilder LLC', 'Libero illo amet do', 'Lawrence', 'Miranda', 'doqefic@mailinator.com', '+1 (881) 898-3652', '+1 (146) 189-5478', '+1 (287) 173-3317', 'Ipsum ullamco elit', 'Voluptatem magni har', 'Blanditiis omnis eos', '61481', 'US', 'Voluptas esse itaqu', 'Pariatur Reiciendis', 'Dolor possimus volu', '25961', 'CA', 'no', '[\"Outfit My Fleet Lease Program\",\"Hard-good Accessories\",\"Soft-good Accessories\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Kawasaki\",\"Cushman\",\"Carry-All\",\"Other\"]', '2026-01-19 15:48:21.419', 0, 'pending', 'asdsad', NULL, '', ''),
(54, 'Joyner and Daniel Associates', 'Quo nulla tempor rec', 'Quail', 'Rosales', 'zasiwudik@mailinator.com', '+1 (233) 412-8093', '+1 (567) 303-4739', '+1 (893) 583-2038', 'Omnis iure in labore', 'Porro et quos id duc', 'Dolorem porro exerci', '45937', 'MX', 'Ex tenetur et omnis ', 'Incidunt doloremque', 'Consectetur beatae h', '83876', 'MX', 'yes', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"Yamaha\",\"Other\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-19 15:57:44.365', 0, 'pending', '', '/uploads/registrations/1768838263423-107893007.png', '', ''),
(55, 'Williams and Rosario Co', 'Qui blanditiis sit ', 'Phillip', 'Benson', 'fexijyve@mailinator.com', '+1 (626) 295-3628', '+1 (794) 531-2454', '+1 (418) 433-9875', 'Nobis doloribus vel ', 'Eu consequatur Ut d', 'Adipisci repudiandae', '34874', 'CA', 'Sit corrupti ipsum', 'Temporibus quo labor', 'Do impedit quia vel', '46516', 'CA', 'no', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Hard-good Accessories\",\"Soft-good Accessories\"]', '[\"E-Z-GO\",\"Other\"]', '[\"Polaris\",\"Umax\",\"Other\"]', '2026-01-19 15:59:30.793', 0, 'pending', 'sadsad', NULL, 'asdasd', ''),
(56, 'Booth Cleveland Plc', 'Alias vel quae volup', 'Paki', 'Chen', 'ur3033213@gmail.com', '+1 (851) 154-9603', '+1 (143) 551-9439', '+1 (997) 996-5089', 'Sed ut et deleniti q', 'Non perferendis anim', 'Et neque ipsum quo s', '57405', 'MX', 'Omnis quidem tempori', 'Magnam et ex saepe c', 'Ea et cum hic maxime', '25265', 'US', 'no', '[\"Enclosures\",\"Hard-good Accessories\",\"Custom Orders\"]', '[\"Club Car\"]', '[\"Polaris\",\"Yamaha\",\"Carry-All\"]', '2026-01-19 16:01:01.353', 0, 'approved', '', NULL, '', ''),
(58, 'Green Rodriquez Co', 'Veniam est sed quib', 'Jane', 'Jennings', 'hyfiwegahu@mailinator.com', '+1 (691) 657-9451', '+1 (885) 946-7443', '+1 (739) 972-4661', 'Voluptatum neque dol', 'Atque libero accusam', 'Voluptatem minim nos', '72830', 'MX', 'Veniam necessitatib', 'Incididunt aut dolor', 'Veritatis dolor cill', '23403', 'MX', 'yes', '[\"Outfit My Fleet Lease Program\",\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-19 16:22:48.115', 0, 'pending', '', '/uploads/registrations/1768839767279-714966509.jpg', '', ''),
(59, 'Test Company', 'Owner', 'steven', 'prehoda', 'prehoda@strading.co', '5167295992', '', '', '66 birch street', 'islip', 'New York', '11751', 'US', '66 birch street', 'islip', 'New York', '11751', 'US', 'no', '[\"Soft-good Accessories\",\"Outfit My Fleet Lease Program\"]', '[\"Club Car\",\"E-Z-GO\"]', '[\"Polaris\",\"Can-Am\",\"Cushman\",\"Umax\"]', '2026-01-19 16:29:16.822', 1, 'pending', '', NULL, '', ''),
(60, 'Mccarthy and Ayers Co', 'Aliquam eius impedit', 'Flynn', 'Bryan', 'lulyli@mailinator.com', '+1 (273) 688-8728', '+1 (765) 165-2719', '+1 (127) 269-5008', 'Omnis eum voluptatem', 'Laboriosam incididu', 'Rerum porro ullam qu', '42829', 'MX', 'Labore rem iure even', 'Qui dolor voluptate ', 'Sunt asperiores moll', '50102', 'MX', 'yes', '[\"Outfit My Fleet Lease Program\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Carry-All\",\"Other\"]', '2026-01-19 16:55:42.707', 0, 'pending', '', '/uploads/registrations/1768841742689-628716840.jpg', '', ''),
(61, 'Raymond Woods Traders', 'Id officiis ducimus', 'Hedley', 'Larsen', 'nisocox@mailinator.com', '+1 (251) 165-5921', '+1 (656) 788-9854', '+1 (644) 469-8154', 'Ratione recusandae ', 'Exercitation eos pos', 'Eu nemo et cumque qu', '27688', 'MX', 'Deserunt cupidatat d', 'Dolorem aut cupidata', 'A cumque aliquip ani', '67147', 'CA', 'yes', '[\"Hard-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Umax\",\"Other\"]', '2026-01-19 18:18:07.943', 0, 'pending', '', '/uploads/registrations/1768846687086-271892774.png', '', '222222'),
(62, 'GoNext', 'test', 'Abdul', 'Ahad', 'abdulahad010274@gmail.com', '03158359722', '03158359722', '03158359722', 'Block 10, Gulistan-e-Johar,', 'Karachi', 'Dolore sint ut conse', '07599', 'US', 'Block 10, Gulistan-e-Johar,', 'Karachi', 'Tenetur reiciendis s', '07599', 'CA', 'no', '[\"Enclosures\"]', '[\"Club Car\"]', '[\"Polaris\"]', '2026-01-20 10:54:46.639', 0, 'pending', '', NULL, '', ''),
(63, 'Brentwood Country Club', 'Course Pro', 'Steven', 'Prehoda', 'prehodacpro@gmail.com', '5167295992', '', '', '10 Lucon Dr', 'Deer Park', 'NY', '11729', 'US', '10 Lucon Dr', 'Deer Park', 'NY', '11729', 'US', 'no', '[\"Enclosures\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\",\"Other\"]', '[\"Other\"]', '2026-01-21 11:10:02.605', 0, 'pending', 'Test', NULL, '', ''),
(64, 'Scott Schneider Trading', 'Illum quasi consequ', 'Zeeshan', 'Phekooo', 'muhammadzeeshan182004@gmail.com', '+1 (447) 816-6494', '+1 (775) 571-9474', '+1 (872) 371-3988', 'Hic ad sapiente corp', 'Corporis nihil ipsam', 'Qui voluptatibus con', '12190', 'MX', 'Illum cupiditate pe', 'Labore laboriosam e', 'Aliquip id est dist', '88051', 'MX', 'no', '[\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\",\"Other\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-01-21 18:41:22.707', 1, 'approved', 'hfghghgfhfg', NULL, '', NULL),
(87, 'Scott Vincent LLC', 'Qui qui corporis et ', 'Charde', 'Franks', 'yamanaaamir2004@gmail.com', '+1 (889) 371-7619', '+1 (229) 708-8868', '+1 (483) 911-1459', 'Earum inventore eius', 'Voluptate error ut o', 'Fuga Ut voluptate n', '52408', 'CA', 'Eveniet labore aut ', 'Qui libero assumenda', 'Consequat Maxime qu', '91243', 'US', 'no', '[\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Cushman\"]', '2026-05-05 15:40:58.952', 1, 'pending', '', NULL, '', NULL),
(88, 'RANGE END COUNTRY CLUB', 'Golf Professional', 'Brett', 'Ernst', 'brett@rangeendgolfclub.com', '7174324114', '', '', '303 Golf Club Avenue', 'DILLSBURG', 'PA', '17019-1548', 'US', '303 Golf Club Avenue', 'DILLSBURG', 'PA', '17019-1548', 'US', 'no', '[\"Enclosures\",\"Maintenance/Utility\",\"Hard-good Accessories\",\"Soft-good Accessories\",\"Custom Orders\"]', '[\"Club Car\",\"E-Z-GO\",\"Yamaha\"]', '[\"Polaris\",\"Can-Am\",\"Yamaha\",\"Honda\",\"Kawasaki\",\"Cushman\",\"Umax\",\"Carry-All\",\"Other\"]', '2026-08-30 19:26:21.713', 0, 'pending', '', NULL, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `HeroSection`
--

CREATE TABLE `HeroSection` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` text DEFAULT NULL,
  `ctaTextOne` varchar(255) DEFAULT NULL,
  `ctaLinkOne` varchar(255) DEFAULT NULL,
  `ctaTextTwo` varchar(255) DEFAULT NULL,
  `ctaLinkTwo` varchar(255) DEFAULT NULL,
  `createdAt` datetime(3) DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `imgAlt` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `HeroSection`
--

INSERT INTO `HeroSection` (`id`, `title`, `description`, `imageUrl`, `ctaTextOne`, `ctaLinkOne`, `ctaTextTwo`, `ctaLinkTwo`, `createdAt`, `updatedAt`, `isActive`, `imgAlt`) VALUES
(1, 'Shop ClubPro Today', 'Fast Delivery • Easy Financing', '/uploads/hero/1778512471394-832712415.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-02-16 07:50:26.414', '2026-05-11 15:14:31.408', 1, 'Shop ClubPro Today'),
(2, 'Discover Premium Golf Carts', 'ClubPro – Quality & Style Combined', '/uploads/hero/1778512538190-245069470.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-02-16 08:17:22.741', '2026-05-11 15:15:38.201', 1, 'Discover Premium Golf Carts'),
(3, 'Ride in Comfort & Performance', 'Perfect for Golf Courses & Neighborhoods', '/uploads/hero/1778512549179-728659204.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-02-16 08:19:06.397', '2026-05-11 15:15:49.186', 1, 'Ride in Comfort & Performance'),
(4, 'Shop ClubPro Today', 'Fast Delivery • Easy Financing', '/uploads/hero/1778512675716-773920321.jpg', 'Shop Now', '/shop', 'How Clubpro Works?', '', '2026-05-11 15:17:55.719', '2026-05-11 15:20:17.347', 1, 'Shop ClubPro Today'),
(5, 'Discover Premium Golf Carts', 'Perfect for Golf Courses & Neighborhoods', '/uploads/hero/1778512742719-173449695.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 15:19:02.722', '2026-05-11 15:20:04.226', 1, 'Discover Premium Golf Carts'),
(6, 'Ride in Comfort & Performance', 'Perfect for Golf Courses & Neighborhoods', '/uploads/hero/1778514767548-652858309.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 15:52:47.564', '2026-05-11 15:52:47.564', 1, 'Ride in Comfort & Performance'),
(7, 'Shop ClubPro Today', 'Fast Delivery • Easy Financing', '/uploads/hero/1778514814459-458987389.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 15:53:34.463', '2026-05-11 15:53:34.463', 1, 'Shop ClubPro Today'),
(8, 'Discover Premium Golf Carts', 'ClubPro – Quality & Style Combined', '/uploads/hero/1778514933534-285213384.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 15:55:33.538', '2026-05-11 15:55:33.538', 1, 'Discover Premium Golf Carts'),
(9, 'Shop ClubPro Today', 'Fast Delivery • Easy Financing', '/uploads/hero/1778515005595-564408165.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 15:56:45.599', '2026-05-11 15:56:45.599', 1, 'Shop ClubPro Today'),
(10, 'Discover Premium Golf Carts', 'ClubPro – Quality & Style Combined', '/uploads/hero/1778516770196-943869714.jpg', 'Shop Now', '', 'How Clubpro Works?', '', '2026-05-11 16:26:10.199', '2026-05-11 16:26:10.199', 1, 'Discover Premium Golf Carts'),
(11, 'Vin 2', 'test', '/uploads/hero/1788373493028-401332871.jpg', 'de', 'de', 'de', 'de', '2026-09-02 18:24:53.052', '2026-09-02 18:24:53.052', 1, 'zipper'),
(12, 'ahad', 'abcde', '/uploads/hero/1788601535182-637135656.png', 'anv', 'flks', 'fldsmf', 'fmds;lkf', '2026-09-05 09:45:35.189', '2026-09-05 09:45:35.189', 1, 'abc');

-- --------------------------------------------------------

--
-- Table structure for table `Model`
--

CREATE TABLE `Model` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `brandId` int(11) NOT NULL,
  `createdAt` datetime(3) DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `seoDescription` text DEFAULT NULL,
  `seoKeywords` text DEFAULT NULL,
  `seoTitle` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Model`
--

INSERT INTO `Model` (`id`, `name`, `brandId`, `createdAt`, `updatedAt`, `seoDescription`, `seoKeywords`, `seoTitle`, `slug`) VALUES
(17, 'Precedent', 1, '2025-12-22 13:43:51.508', '2025-12-22 13:43:51.508', NULL, NULL, NULL, NULL),
(18, 'Carryall', 1, '2025-12-22 13:43:53.369', '2025-12-22 13:43:53.369', NULL, NULL, NULL, NULL),
(19, 'Carryall 502', 1, '2025-12-22 13:43:59.665', '2025-12-22 13:43:59.665', NULL, NULL, NULL, NULL),
(20, 'Universal', 2, '2025-12-22 13:44:04.414', '2025-12-22 13:44:04.414', NULL, NULL, NULL, NULL),
(21, '2 Passenger Universal', 2, '2025-12-22 13:44:06.053', '2025-12-22 13:44:06.053', NULL, NULL, NULL, NULL),
(22, '4 Passenger Universal', 2, '2025-12-22 13:44:07.486', '2025-12-22 13:44:07.486', NULL, NULL, NULL, NULL),
(23, 'RXV', 3, '2025-12-22 13:44:12.108', '2025-12-22 13:44:12.108', NULL, NULL, NULL, NULL),
(24, 'TXT', 3, '2025-12-22 13:44:13.339', '2025-12-22 13:44:13.339', NULL, NULL, NULL, NULL),
(25, 'G22/GPS/Advanced', 4, '2025-12-22 13:44:15.489', '2025-12-22 13:44:15.489', NULL, NULL, NULL, NULL),
(26, 'Drive/Drive2', 4, '2025-12-22 13:44:16.710', '2025-12-22 13:44:16.710', NULL, NULL, NULL, NULL),
(27, 'Drive', 4, '2025-12-22 13:44:17.887', '2025-12-22 13:44:17.887', NULL, NULL, NULL, NULL),
(28, 'Drive2', 4, '2025-12-22 13:44:19.079', '2025-12-22 13:44:19.079', NULL, NULL, NULL, NULL),
(29, 'Umax', 4, '2025-12-22 13:44:20.648', '2025-12-22 13:44:20.648', NULL, NULL, NULL, NULL),
(31, 'RXV 2-Pass', 3, '2025-12-23 20:23:27.714', '2025-12-23 20:23:27.714', NULL, NULL, NULL, NULL),
(32, 'RXV 4-Pass', 3, '2025-12-23 20:23:37.665', '2025-12-23 20:23:37.665', NULL, NULL, NULL, NULL),
(33, 'RXV Hauler Pro', 3, '2025-12-23 20:28:52.794', '2025-12-23 20:28:52.794', NULL, NULL, NULL, NULL),
(35, 'E-Z-GO', 9, '2026-01-19 18:55:09.332', '2026-03-26 12:11:59.473', NULL, NULL, NULL, NULL),
(36, 'Yamaha', 9, '2026-01-19 18:55:21.980', '2026-01-19 18:55:21.980', NULL, NULL, NULL, NULL),
(37, 'ClubCar', 9, '2026-01-19 18:55:42.318', '2026-03-26 14:43:42.262', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Order`
--

CREATE TABLE `Order` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `status` enum('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `totalAmount` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `labelUrl` text DEFAULT NULL,
  `serviceLevel` varchar(100) DEFAULT NULL,
  `shipmentCost` decimal(10,2) DEFAULT NULL,
  `shipmentStatus` varchar(100) DEFAULT 'UNKNOWN',
  `trackingNumber` varchar(255) DEFAULT NULL,
  `fishbowlSalesOrderNumber` varchar(100) DEFAULT NULL,
  `shipAddress1` varchar(255) DEFAULT NULL,
  `shipAddress2` varchar(255) DEFAULT NULL,
  `shipCity` varchar(100) DEFAULT NULL,
  `shipCountry` varchar(2) DEFAULT NULL,
  `shipEmail` varchar(255) DEFAULT NULL,
  `shipFirstName` varchar(100) DEFAULT NULL,
  `shipLastName` varchar(100) DEFAULT NULL,
  `shipPhone` varchar(50) DEFAULT NULL,
  `shipState` varchar(100) DEFAULT NULL,
  `shipZip` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Order`
--

INSERT INTO `Order` (`id`, `customerId`, `status`, `totalAmount`, `createdAt`, `updatedAt`, `carrier`, `labelUrl`, `serviceLevel`, `shipmentCost`, `shipmentStatus`, `trackingNumber`, `fishbowlSalesOrderNumber`, `shipAddress1`, `shipAddress2`, `shipCity`, `shipCountry`, `shipEmail`, `shipFirstName`, `shipLastName`, `shipPhone`, `shipState`, `shipZip`) VALUES
(8, 24, 'CANCELLED', 38.98, '2026-01-17 12:15:19.639', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 24, 'CANCELLED', 57.99, '2026-01-19 22:27:42.540', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 24, 'CANCELLED', 173.97, '2026-01-20 08:12:46.033', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 24, 'CANCELLED', 65.98, '2026-01-20 08:14:57.963', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 24, 'CANCELLED', 57.99, '2026-01-20 12:52:55.280', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 24, 'CANCELLED', 219.00, '2026-01-20 13:54:17.604', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 24, 'CANCELLED', 27.00, '2026-01-20 13:55:12.792', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 24, 'CANCELLED', 115.98, '2026-01-20 14:13:34.468', '2026-01-20 14:43:36.532', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 24, 'PAID', 57.99, '2026-01-20 14:41:45.902', '2026-01-20 14:41:45.902', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 24, 'PAID', 0.00, '2026-01-20 17:05:38.161', '2026-01-20 17:05:38.161', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 24, 'PAID', 0.00, '2026-01-21 08:21:01.319', '2026-01-21 08:21:01.319', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 24, 'PAID', 0.00, '2026-01-21 08:52:21.109', '2026-01-21 08:52:21.109', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 24, 'PAID', 0.00, '2026-01-21 08:54:48.208', '2026-01-21 08:54:48.208', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 24, 'PAID', 0.00, '2026-01-21 09:09:03.233', '2026-01-21 09:09:03.233', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 24, 'PAID', 48.00, '2026-01-21 09:32:27.676', '2026-01-21 09:32:27.676', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 24, 'PAID', 0.00, '2026-01-21 09:37:29.894', '2026-01-21 09:37:29.894', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 24, 'PAID', 0.00, '2026-01-21 09:44:59.316', '2026-01-21 09:44:59.316', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 24, 'PAID', 48.00, '2026-01-21 10:01:53.628', '2026-01-21 10:01:53.628', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 24, 'PAID', 0.00, '2026-01-21 10:13:07.698', '2026-01-21 10:13:07.698', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 24, 'PAID', 48.00, '2026-01-21 10:22:11.227', '2026-01-21 10:22:11.227', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 24, 'PAID', 48.00, '2026-01-21 10:33:43.994', '2026-01-21 10:33:43.994', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 24, 'PAID', 48.00, '2026-01-21 10:37:20.802', '2026-01-21 10:37:20.802', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 24, 'PAID', 48.00, '2026-01-21 10:44:14.022', '2026-01-21 10:44:14.022', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 24, 'PAID', 48.00, '2026-01-21 10:51:24.033', '2026-01-21 10:51:24.033', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 24, 'PAID', 48.00, '2026-01-21 10:57:18.199', '2026-01-21 10:57:18.199', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 24, 'PAID', 0.00, '2026-01-21 11:03:17.048', '2026-01-21 11:03:17.048', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 24, 'PAID', 48.00, '2026-01-21 11:25:21.780', '2026-01-21 11:25:21.780', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 24, 'PAID', 48.00, '2026-01-21 11:37:33.310', '2026-01-21 11:37:33.310', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 24, 'PAID', 48.00, '2026-01-21 11:47:37.753', '2026-01-21 11:47:37.753', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 24, 'PAID', 48.00, '2026-01-21 12:42:39.904', '2026-01-21 12:42:39.904', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 24, 'PAID', 75.65, '2026-01-21 13:22:10.828', '2026-01-21 13:22:10.828', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 24, 'PAID', 75.65, '2026-01-21 13:22:11.181', '2026-01-21 13:22:11.181', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 24, 'PAID', 57.45, '2026-01-21 13:37:48.227', '2026-01-21 13:37:48.227', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 24, 'PAID', 58.00, '2026-01-21 13:43:22.973', '2026-01-21 13:43:22.973', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 24, 'PAID', 58.00, '2026-01-21 13:43:22.642', '2026-01-21 13:43:31.226', NULL, 'https://deliver.goshippo.com/6b23f8dc5a89444484b3166c4fd8e9bb.pdf?Expires=1800539011&Signature=YsxDJusV5rqFCX-tmgf~nYznu4LE8AlEXU0KYtEQu~qJYsIXqnA3HmHqm5T7g98OG5HeRI5PF0~5l6z-lkqOOJBuRq1o4VhkYuTAtjNrukCAEgELBSxlY7llC0FdyIWdbnI11EfOObp1~w568HvGCMC1LSqZ3GIogrK5Bp5kamECKgrfRUCIdAvoqik8uX0AkjMCmiQBjWIEt6~MChhtvk-MHk3I8FfYKmmj3o3yTUkY2JIfsfZJVFtQCL0fL~Tfgp7A1vgUwBPR9K4cyWB3mKBeuHAz7WyvvmHT-n39r4hyUXloLFJF4ZvY8Yc8BripULKNzQh8-sRtnepLMlkf4w__&Key-Pair-Id=APKAJRICFXQ2S4YUQRSQ', 'ups_ground_saver', 9.45, 'UNKNOWN', '1ZXXXXXXXXXXXXXXXX', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 24, 'PAID', 57.45, '2026-01-21 14:29:50.715', '2026-01-21 14:29:50.715', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 24, 'PAID', 57.45, '2026-01-21 14:37:00.422', '2026-01-21 14:37:00.422', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 24, 'PAID', 58.00, '2026-01-21 14:42:25.168', '2026-01-21 14:42:25.168', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 24, 'PAID', 57.45, '2026-01-21 14:45:48.791', '2026-01-21 14:45:48.791', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 24, 'PAID', 57.45, '2026-01-21 14:45:48.441', '2026-01-21 14:45:48.441', NULL, NULL, NULL, 9.45, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 24, 'PAID', 57.45, '2026-01-21 14:52:47.920', '2026-01-21 14:52:47.920', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 24, 'PAID', 57.45, '2026-01-21 14:52:48.181', '2026-01-21 14:52:48.181', NULL, NULL, NULL, 9.45, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 24, 'PAID', 380.34, '2026-01-21 15:23:45.610', '2026-01-21 15:23:45.610', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 24, 'PAID', 393.35, '2026-01-21 15:25:26.613', '2026-01-21 15:25:26.613', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 24, 'PAID', 486.87, '2026-01-21 15:27:02.038', '2026-01-21 15:27:02.038', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 24, 'PAID', 486.87, '2026-01-21 15:27:01.772', '2026-01-21 15:27:01.772', NULL, NULL, NULL, 266.88, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 24, 'PAID', 329.19, '2026-01-21 17:30:17.688', '2026-01-21 17:30:17.688', NULL, NULL, NULL, NULL, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 24, 'PAID', 329.19, '2026-01-21 17:30:18.428', '2026-01-21 17:30:18.428', NULL, NULL, NULL, 144.19, 'UNKNOWN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 40, 'PAID', 119.00, '2026-08-28 08:03:55.215', '2026-08-28 08:03:55.215', NULL, NULL, NULL, 0.00, 'UNKNOWN', NULL, NULL, 'In dolorem corporis', 'italy germany france', 'Adipisci dolor at al', 'US', 'yamanaamir2004@gmail.com', 'yamanaamir', NULL, '+12015550123', 'Lorem at nostrud ull', '18979'),
(77, 40, 'PAID', 34.99, '2026-09-04 17:43:56.544', '2026-09-04 17:43:56.544', NULL, NULL, NULL, 0.00, 'UNKNOWN', NULL, NULL, 'In dolorem corporis', 'abbbccccccccc', 'Adipisci dolor at al', 'US', 'yamanaamir2004@gmail.com', 'amir', NULL, '+12015550123', 'Lorem at nostrud ull', '18979'),
(78, 40, 'PAID', 315.00, '2026-09-04 17:53:05.378', '2026-09-05 10:49:22.174', NULL, NULL, NULL, 0.00, 'UNKNOWN', NULL, NULL, 'In dolorem corporis', 'fldsfd/f;sfjkds;/', 'Adipisci dolor at al', 'US', 'yamanaamir2004@gmail.com', 'OSAMA', NULL, '+12015550123', 'Lorem at nostrud ull', '18979');

-- --------------------------------------------------------

--
-- Table structure for table `OrderItem`
--

CREATE TABLE `OrderItem` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `priceAtOrder` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `OrderItem`
--

INSERT INTO `OrderItem` (`id`, `orderId`, `productId`, `quantity`, `priceAtOrder`) VALUES
(21, 18, 1362, 2, 0.00),
(22, 19, 1297, 1, 0.00),
(23, 20, 1301, 1, 0.00),
(24, 21, 1331, 1, 0.00),
(25, 22, 1337, 1, 0.00),
(26, 23, 1364, 1, 48.00),
(27, 24, 1306, 1, 0.00),
(28, 25, 1306, 1, 0.00),
(29, 26, 1364, 1, 48.00),
(30, 27, 1306, 1, 0.00),
(32, 29, 1364, 1, 48.00),
(34, 31, 1364, 1, 48.00),
(36, 33, 1364, 1, 48.00),
(38, 35, 1364, 1, 48.00),
(40, 37, 1364, 1, 48.00),
(42, 39, 1364, 1, 48.00),
(44, 41, 1337, 1, 0.00),
(46, 43, 1364, 1, 48.00),
(48, 45, 1364, 1, 48.00),
(50, 47, 1364, 1, 48.00),
(52, 49, 1364, 1, 48.00),
(54, 51, 1364, 1, 48.00),
(55, 52, 1364, 1, 48.00),
(56, 53, 1364, 1, 48.00),
(58, 55, 1364, 1, 48.00),
(59, 56, 1364, 1, 48.00),
(60, 57, 1364, 1, 48.00),
(62, 59, 1364, 1, 48.00),
(64, 61, 1364, 1, 48.00),
(66, 63, 1364, 1, 48.00),
(67, 64, 1364, 1, 48.00),
(68, 65, 1364, 1, 48.00),
(69, 66, 1364, 1, 48.00),
(70, 67, 1331, 1, 279.00),
(71, 67, 1335, 1, 34.99),
(74, 69, 1363, 1, 48.00),
(75, 69, 1352, 1, 279.00),
(78, 71, 1297, 1, 185.00),
(79, 71, 1305, 1, 34.99),
(80, 72, 1297, 1, 185.00),
(81, 72, 1305, 1, 34.99),
(82, 73, 1297, 1, 185.00),
(83, 74, 1297, 1, 185.00),
(85, 76, 1324, 1, 119.00),
(86, 77, 1305, 1, 34.99),
(87, 78, 1300, 1, 315.00);

-- --------------------------------------------------------

--
-- Table structure for table `PageSeo`
--

CREATE TABLE `PageSeo` (
  `id` int(11) NOT NULL,
  `pageName` varchar(100) NOT NULL,
  `seoTitle` varchar(255) DEFAULT NULL,
  `seoDescription` text DEFAULT NULL,
  `seoKeywords` text DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `PageSeo`
--

INSERT INTO `PageSeo` (`id`, `pageName`, `seoTitle`, `seoDescription`, `seoKeywords`, `slug`, `updatedAt`) VALUES
(1, 'home', 'club pro', 'club pro', 'club pro', 'home', '2026-09-05 10:47:52.564');

-- --------------------------------------------------------

--
-- Table structure for table `PasswordResetAttempt`
--

CREATE TABLE `PasswordResetAttempt` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `PasswordResetAttempt`
--

INSERT INTO `PasswordResetAttempt` (`id`, `customerId`, `createdAt`) VALUES
(1, 40, '2026-02-12 07:29:41.348'),
(2, 40, '2026-02-12 07:31:13.681'),
(3, 40, '2026-02-12 07:34:25.960'),
(4, 40, '2026-02-12 07:43:21.459'),
(5, 40, '2026-02-12 07:44:51.587'),
(6, 40, '2026-02-12 07:47:56.634'),
(7, 40, '2026-02-12 07:57:02.557'),
(8, 40, '2026-02-12 07:58:20.359'),
(9, 40, '2026-02-12 07:59:21.516'),
(10, 40, '2026-02-12 08:27:20.634'),
(11, 40, '2026-02-12 08:29:46.643'),
(12, 40, '2026-02-12 09:47:15.903'),
(13, 40, '2026-02-12 10:03:57.740'),
(14, 40, '2026-02-12 13:27:16.978'),
(15, 40, '2026-02-13 07:56:25.687'),
(16, 40, '2026-02-26 07:30:23.854'),
(17, 41, '2026-05-05 10:12:08.623'),
(18, 40, '2026-05-05 10:13:22.803'),
(19, 40, '2026-05-05 10:15:38.113'),
(20, 40, '2026-05-05 10:18:19.833'),
(21, 41, '2026-05-05 10:19:01.116'),
(22, 41, '2026-05-05 10:27:08.886'),
(23, 40, '2026-05-05 10:27:58.306'),
(24, 40, '2026-05-05 10:30:40.057'),
(25, 40, '2026-05-05 10:32:09.078'),
(26, 41, '2026-05-05 10:32:59.701'),
(27, 40, '2026-05-05 11:43:22.730'),
(28, 40, '2026-05-05 11:44:58.806'),
(29, 41, '2026-05-05 11:45:46.093'),
(30, 41, '2026-05-05 11:47:51.908'),
(31, 41, '2026-05-05 11:49:41.041'),
(32, 41, '2026-05-05 11:50:46.936'),
(33, 40, '2026-05-05 11:58:26.062'),
(34, 40, '2026-05-05 11:59:12.586'),
(35, 40, '2026-05-05 12:00:25.886'),
(36, 40, '2026-05-05 14:32:32.646'),
(37, 40, '2026-05-05 14:37:22.598'),
(38, 40, '2026-05-05 14:37:27.222'),
(39, 40, '2026-05-05 14:58:22.598'),
(40, 44, '2026-05-05 15:42:07.315'),
(41, 44, '2026-05-05 15:45:30.143');

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `regularPrice` decimal(10,2) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `brandId` int(11) NOT NULL,
  `modelId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `imageFour` varchar(191) DEFAULT NULL,
  `imageOne` varchar(191) DEFAULT NULL,
  `imageThree` varchar(191) DEFAULT NULL,
  `imageTwo` varchar(191) DEFAULT NULL,
  `description` varchar(191) NOT NULL,
  `heightIn` decimal(8,2) DEFAULT NULL,
  `lengthIn` decimal(8,2) DEFAULT NULL,
  `weightLb` decimal(8,2) DEFAULT NULL,
  `widthIn` decimal(8,2) DEFAULT NULL,
  `seoDescription` text DEFAULT NULL,
  `seoKeywords` text DEFAULT NULL,
  `seoTitle` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `imgAltFour` varchar(191) DEFAULT NULL,
  `imgAltOne` varchar(191) DEFAULT NULL,
  `imgAltThree` varchar(191) DEFAULT NULL,
  `imgAltTwo` varchar(191) DEFAULT NULL,
  `fishbowlPartNumber` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Product`
--

INSERT INTO `Product` (`id`, `name`, `stock`, `salePrice`, `regularPrice`, `color`, `brandId`, `modelId`, `typeId`, `createdAt`, `updatedAt`, `imageFour`, `imageOne`, `imageThree`, `imageTwo`, `description`, `heightIn`, `lengthIn`, `weightLb`, `widthIn`, `seoDescription`, `seoKeywords`, `seoTitle`, `slug`, `imgAltFour`, `imgAltOne`, `imgAltThree`, `imgAltTwo`, `fishbowlPartNumber`, `sku`) VALUES
(1292, '3-Sided Precedent Enclosure', 0, 0.00, 279.00, 'Beige', 1, 17, 2, '2026-01-20 15:59:27.858', '2026-08-21 16:26:06.849', NULL, '1776959031209-738439632.webp', NULL, NULL, 'Designed specifically for the Club Car Precedent and Onward model golf cars Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1292'),
(1293, '3-Sided Precedent Enclosure', 0, 0.00, 279.00, 'Black', 1, 17, 2, '2026-01-20 15:59:29.304', '2026-08-21 16:26:08.318', NULL, '1776959008955-487530144.webp', NULL, NULL, 'Designed specifically for the Club Car Precedent and Onward model golf cars Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1293'),
(1294, '3 x 4 Precedent Enclosure', 0, 0.00, 215.00, 'Black', 1, 17, 2, '2026-01-20 15:59:30.309', '2026-08-21 16:26:09.239', NULL, '1776959353729-51573958.webp', NULL, NULL, 'Designed exclusively for the Club Car Precedent model Patented roll-away front windshield for vehicles with windshields in place Windshield of cover lies flush against windshield of g', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1294'),
(1295, '3 x 4 Precedent Enclosure', 0, 0.00, 215.00, 'Tan', 1, 17, 2, '2026-01-20 15:59:31.332', '2026-08-21 16:26:10.168', NULL, '1776959337452-523882127.webp', NULL, NULL, 'Designed exclusively for the Club Car Precedent model Patented roll-away front windshield for vehicles with windshields in place Windshield of cover lies flush against windshield of g', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1295'),
(1296, '3 x 4 Precedent Enclosure', 0, 0.00, 215.00, 'Forest Green', 1, 17, 2, '2026-01-20 15:59:32.760', '2026-08-21 16:26:11.083', NULL, '1776959322326-654927140.webp', NULL, NULL, 'Designed to fit exclusively on the Club Car Precedent model Patented storage boot neatly and easily stores away cover Easy installation, Maximum functionality Stainless steel frame', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1296'),
(1297, 'Club Car Precedent Cabana Bag Cover', 10, 0.00, 185.00, 'Beige', 1, 17, 2, '2026-01-20 15:59:33.789', '2026-08-21 16:26:12.018', NULL, 'CLUB-CAR-PRECEDENT-CABANA.webp', NULL, NULL, 'Designed to fit exclusively on the Club Car Precedent model Patented storage boot neatly and easily stores away cover Easy installation, Maximum functionality Stainless steel frame', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1297'),
(1298, 'Club Car Precedent Cabana Bag Cover', 0, 0.00, 185.00, 'Black', 1, 17, 2, '2026-01-20 15:59:34.798', '2026-08-21 16:26:12.932', NULL, '/1778169301644-704266214.jpeg', NULL, NULL, 'Designed to fit exclusively on the Club Car Precedent model Patented storage boot neatly and easily stores away cover Easy installation, Maximum functionality Stainless steel frame', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1298'),
(1299, 'Carryall Hoodie Enclosure', 0, 0.00, 215.00, 'Black', 1, 18, 2, '2026-01-20 15:59:36.026', '2026-08-21 16:26:13.848', NULL, 'carryall_black_1.jpg', NULL, 'carryall_black_2.jpg', 'Designed to fit the Carryall model 502 Over-the-top design for quick install Zippered doors for easy access 3-sided design with no windshield', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1299'),
(1300, 'Carryall Hoodie Enclosure', 1, 0.00, 315.00, 'Beige', 1, 18, 2, '2026-01-20 15:59:37.053', '2026-09-04 17:53:08.461', NULL, 'carry_all_front_closed.png', NULL, NULL, 'Designed to fit the Carryall model 502 Over-the-top design for quick install Zippered doors for easy access 3-sided design with no windshield', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1300'),
(1301, 'Club Car Precedent Rail Enclosure', 0, 0.00, 279.00, NULL, 1, 17, 2, '2026-01-20 15:59:38.269', '2026-08-21 16:26:15.684', NULL, 'cpm_club_car_precedent_rail_enclosure_closed.webp', NULL, NULL, 'Side rails attach using factory mounting locations Plastic rails, no corrosion. Easier to work with vs aluminum Marine grade fabric and zippers for durability Jam cleat bungee hooks', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1301'),
(1302, 'Carryall 502 Hoodie Enclosure', 1, 0.00, 315.00, 'Black', 1, 19, 2, '2026-01-20 15:59:39.487', '2026-08-21 16:26:16.596', NULL, 'club_car_carryall_hero-scaled.webp', NULL, '/1780401894588-940265698.jpg', 'Designed to fit the Carryall model 502 Over-the-top design for quick install Zippered doors for easy access 3-sided design with no windshield', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1302'),
(1303, 'Carryall 502 Hoodie Enclosure', 0, 0.00, 315.00, 'Beige', 1, 19, 2, '2026-01-20 15:59:40.491', '2026-08-21 16:26:17.509', NULL, 'club_car_carryall_502_beige_1.jpg', 'club_car_carryall_502_beige_3.jpg', 'club_car_carryall_502_beige_2.jpg', 'Designed to fit the Carryall model 502 Over-the-top design for quick install Zippered doors for easy access 3-sided design with no windshield', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1303'),
(1304, 'Sand and Speed Bottle - Club Car Precedent', 9, 0.00, 17.00, NULL, 1, 17, 3, '2026-01-20 15:59:41.922', '2026-08-21 16:26:18.424', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1304'),
(1305, 'Quiksand Bottle - Club Car Precedent', 8, 0.00, 34.99, NULL, 1, 17, 3, '2026-01-20 15:59:42.934', '2026-09-04 17:43:59.736', NULL, 'quiksand_limage_1.webp', NULL, NULL, '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1305'),
(1306, 'Jam Cleats', 392, 0.00, 13.99, NULL, 2, 20, 4, '2026-01-20 15:59:44.570', '2026-08-21 16:26:20.254', NULL, 'jam_cleats_revised_image_1.webp', NULL, 'jam_cleats_revised_image_3.webp', 'Hook fasteners that quickly secure your enclosure to the bottom side of golf car Comes complete with heavy plastic hook and bungee strap When installing, insert the bungee through the g', 1.00, 9.00, 0.32, 11.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1306'),
(1307, 'Storage Cover-2 Passenger', 0, 0.00, 105.00, NULL, 2, 21, 4, '2026-01-20 15:59:45.771', '2026-08-21 16:26:21.168', NULL, 'STORAGE-COVER.jpg', NULL, NULL, 'Will fit most golf cars with a standard roof top, about 60 long. Constructed of Marine grade fabrics Elastic system around bottom secures your golf car', 3.00, 21.00, 6.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1307'),
(1308, 'Storage Cover-4 Passenger', 0, 0.00, 125.00, NULL, 2, 22, 4, '2026-01-20 15:59:46.995', '2026-08-21 16:26:22.081', NULL, 'STORAGE-COVER (2).jpg', NULL, NULL, 'Will fit most golf cars with an 80 roof top Constructed of Marine grade fabrics Elastic system around bottom secures your golf car from the elements Long life with proper care', 3.00, 21.00, 6.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1308'),
(1309, 'Ranger Protector', 118, 0.00, 425.00, NULL, 2, 21, 2, '2026-01-20 15:59:48.018', '2026-08-21 16:26:23.178', NULL, 'ranger.protector.jpg', NULL, NULL, 'Larger design to fit the Yamaha Drive and Drive2 models Made of strong polypropylene netting that stops golf ball penetration Indispensable back up for when metal cages need repair', 5.00, 34.00, 15.00, 18.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1309'),
(1310, 'Ranger Protector for Yamaha', 0, 0.00, 475.00, NULL, 2, 21, 2, '2026-01-20 15:59:49.044', '2026-08-21 16:26:24.097', NULL, 'RANGER-PROTECTOR-1 (2).webp', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 5.00, 34.00, 15.00, 18.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1310'),
(1311, '3 x 4 Universal Enclosure', 22, 0.00, 215.00, 'Black', 2, 21, 2, '2026-01-20 15:59:50.052', '2026-08-21 16:26:25.011', NULL, '1776959290934-853619476.webp', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1311'),
(1312, '3 x 4 Universal Enclosure', 14, 0.00, 215.00, 'Tan', 2, 21, 2, '2026-01-20 15:59:51.076', '2026-08-21 16:26:25.927', NULL, '1776959273389-556345040.webp', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1312'),
(1313, '3 x 4 Universal Enclosure', 12, 0.00, 215.00, 'Forest Green', 2, 21, 2, '2026-01-20 15:59:52.086', '2026-08-21 16:26:26.849', NULL, '1776959250236-997884028.webp', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1313'),
(1314, '3 x 4 Universal Enclosure', 2, 0.00, 215.00, 'Navy', 2, 21, 2, '2026-01-20 15:59:53.102', '2026-08-21 16:26:27.764', NULL, '3x4_universal_enclosure_navy.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1314'),
(1315, '3 x 4 Universal Enclosure', 12, 0.00, 215.00, 'Red', 2, 21, 2, '2026-01-20 15:59:54.098', '2026-08-21 16:26:28.678', NULL, '3x4_universal_enclosure_red.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Patented roll-away front windshie', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1315'),
(1316, 'The Hoodie Universal Enclosure', 0, 0.00, 215.00, 'Black', 2, 21, 2, '2026-01-20 15:59:55.119', '2026-08-21 16:26:29.593', NULL, '1776959083096-717233710.webp', NULL, NULL, 'Fits all standard size golf cars, including the EZ-GO TXT and RXV models and Club Car DS and Precedent models Perfect for golf cars with windshields already in place Border edge around', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1316'),
(1317, 'The Hoodie Universal Enclosure', 1, 0.00, 215.00, 'Tan', 2, 21, 2, '2026-01-20 15:59:56.127', '2026-08-21 16:26:30.506', NULL, 'HOODIE_CLUB-CAR_WINDSHIELD-CINCHED-copy.webp', NULL, '1776959188402-144784894.webp', 'Fits all standard size golf cars, including the EZ-GO TXT and RXV models and Club Car DS and Precedent models Perfect for golf cars with windshields already in place Border edge around', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1317'),
(1318, 'The Hoodie Universal Enclosure', 5, 0.00, 215.00, 'Forest Green', 2, 21, 2, '2026-01-20 15:59:57.346', '2026-08-21 16:26:31.420', NULL, '1776959164821-693248882.webp', NULL, NULL, 'Fits all standard size golf cars, including the EZ-GO TXT and RXV models and Club Car DS and Precedent models Perfect for golf cars with windshields already in place Border edge around', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1318'),
(1319, 'The Hoodie Universal Enclosure', 0, 0.00, 215.00, 'Red', 2, 21, 2, '2026-01-20 15:59:58.362', '2026-08-21 16:26:32.336', NULL, '1776959136180-783591178.webp', NULL, NULL, 'Fits all standard size golf cars, including the EZ-GO TXT and RXV models and Club Car DS and Precedent models Perfect for golf cars with windshields already in place Border edge around', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1319'),
(1320, 'The Hoodie Universal Enclosure', 19, 0.00, 215.00, 'Navy', 2, 21, 2, '2026-01-20 15:59:59.385', '2026-08-21 16:26:33.257', NULL, '1776959109878-889275127.webp', NULL, NULL, 'Fits all standard size golf cars, including the EZ-GO TXT and RXV models and Club Car DS and Precedent models Perfect for golf cars with windshields already in place Border edge around', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1320'),
(1321, 'Sand and Speed Bottle - Other', 10, 0.00, 17.00, NULL, 2, 20, 3, '2026-01-20 16:00:00.392', '2026-08-21 16:26:34.171', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1321'),
(1322, 'Quiksand Bottle - Other', 8, 0.00, 17.00, NULL, 2, 20, 3, '2026-01-20 16:00:01.404', '2026-08-21 16:26:35.099', NULL, 'quiksand_limage_1.webp', NULL, NULL, '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1322'),
(1323, 'Iron Maid Club Cleaner - Universal', 21, 0.00, 35.00, NULL, 2, 20, 3, '2026-01-20 16:00:02.414', '2026-08-21 16:26:36.013', '/1780400962663-977298136.jpg', 'iron_maid__image_1.jpg', '/1780400962662-294740557.jpg', '/1780400904830-225896610.jpg', 'Added accessory in unused mounting area Bagwell mount maintains the integrity of the fender Easily removable cartridge for cleaning Heavy duty, molded rubber splash guard Side win', 5.00, 9.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1323'),
(1324, 'The Golf Car Cooler', 78, 0.00, 119.00, NULL, 2, 20, 1, '2026-01-20 16:00:03.637', '2026-08-28 08:03:58.213', 'cooler_standard_script.webp', 'cooler_primary_image_plain.webp', 'cooler_closeup_plain_and_embroidered.webp', 'cooler_secondary_plain_and_embroidered.webp', 'Constructed of Marine grade vinyl Durable, UV resistant and easy to clean Takes seconds to secure or take off Holds over 18 drinks with ice Multiple pockets for snacks, dry good a', 3.00, 28.00, 3.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1324'),
(1325, 'Ranger Caps - Handicapped', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:04.652', '2026-08-21 16:26:37.853', NULL, 'ranger_caps_handicap.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1325'),
(1326, 'Ranger Caps - Marshall', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:05.670', '2026-08-21 16:26:38.960', NULL, 'ranger_caps_marshall.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1326'),
(1327, 'Ranger Caps - Players Assistant', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:06.689', '2026-08-21 16:26:39.888', NULL, 'ranger_caps_players_assistant.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1327'),
(1328, 'Ranger Caps - Ranger', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:07.720', '2026-08-21 16:26:40.805', NULL, 'ranger_caps_staff.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1328'),
(1329, 'Ranger Caps - Staff', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:08.736', '2026-08-21 16:26:41.724', NULL, 'ranger_caps_staff.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1329'),
(1330, 'Ranger Caps - Starter', 85, 0.00, 129.00, NULL, 2, 20, 1, '2026-01-20 16:00:09.754', '2026-08-21 16:26:42.643', NULL, 'ranger_caps_starter.jpg', NULL, NULL, 'Fits all standard size golf cars, including the Club Car DS and Precedent models, the E-Z-GO TXT and RXV models as well as 2004 and older Yamaha models. Made of strong polypropylene nettin', 3.00, 21.00, 3.00, 17.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1330'),
(1331, '3-Sided Enclosure RXV', 0, 0.00, 279.00, 'Beige', 3, 23, 2, '2026-01-20 16:00:11.160', '2026-08-21 16:26:43.567', '/1780394566078-599224889.jpg', '1776959473120-732483953.webp', '/1780394553917-301894189.jpg', '/1780394514858-377876966.jpg', 'Designed specifically for the E-Z-GO RXV model (2006-Present) Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1331'),
(1332, '3-Sided Enclosure RXV', 0, 0.00, 279.00, 'Black', 3, 23, 2, '2026-01-20 16:00:12.162', '2026-08-21 16:26:44.491', NULL, '1776959455813-652049089.webp', NULL, NULL, 'Designed specifically for the E-Z-GO RXV model (2006-Present) Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1332'),
(1333, 'Sand and Speed Bottle - EZ-GO RXV', 9, 0.00, 35.00, NULL, 3, 23, 3, '2026-01-20 16:00:13.375', '2026-08-21 16:26:45.414', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1333'),
(1334, 'Sand and Speed Bottle - EZ-GO TXT', 10, 0.00, 35.00, NULL, 3, 24, 3, '2026-01-20 16:00:14.589', '2026-08-21 16:26:46.327', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1334'),
(1335, 'Quiksand Bottle - EZ-GO RXV', 10, 0.00, 34.99, NULL, 3, 23, 3, '2026-01-20 16:00:15.586', '2026-08-21 16:26:47.241', NULL, 'quiksand_limage_1.webp', NULL, NULL, '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1335'),
(1336, 'Quiksand Bottle - EZ-GO TXT', 12, 0.00, 34.99, NULL, 3, 24, 3, '2026-01-20 16:00:16.600', '2026-08-21 16:26:48.158', NULL, 'quiksand_limage_1.webp', NULL, NULL, '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1336'),
(1337, '3 x 4 Yamaha G22/GPS/Advanced Enclosure', 3, 0.00, 279.00, 'Black', 4, 25, 2, '2026-01-20 16:00:18.027', '2026-08-21 16:26:49.071', NULL, '3x4_G22_GPS_1.webp', NULL, '3x4_G22_GPS_2.webp', '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1337'),
(1338, 'Yamaha Drive/Drive2 Cabana Bag Cover - Beige', 0, 0.00, 239.00, NULL, 4, 26, 4, '2026-01-20 16:00:19.248', '2026-08-21 16:26:49.986', NULL, 'YAMAHA-CABANA-COVER_02.09.18.webp', NULL, NULL, 'Designed to fit exclusively on the Yamaha Drive or Drive2 models Storm Flap allows maximum sweater basket protection Zippered Storage Boot extends the life of the product Patented', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1338'),
(1339, 'Yamaha Drive/Drive2 Cabana Bag Cover - Beige, Yamaha Drive', 10, 0.00, 239.00, NULL, 4, 26, 4, '2026-01-20 16:00:20.255', '2026-08-21 16:26:50.913', NULL, 'YAMAHA-CABANA-COVER_02.09.18.webp', NULL, 'YAMAHA_CABANA-COVER_CUSTOM-EMBROIDERY-copy_1.webp', 'Designed to fit exclusively on the Yamaha Drive or Drive2 models Storm Flap allows maximum sweater basket protection Zippered Storage Boot extends the life of the product Patented', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1339'),
(1340, 'Yamaha Drive/Drive2 Cabana Bag Cover - Beige, Yamaha Drive 2', 10, 0.00, 239.00, NULL, 4, 26, 4, '2026-01-20 16:00:21.276', '2026-08-21 16:26:51.846', NULL, 'YAMAHA-CABANA-COVER_02.09.18.webp', NULL, 'YAMAHA_CABANA-COVER_CUSTOM-EMBROIDERY-copy_1.webp', 'Designed to fit exclusively on the Yamaha Drive or Drive2 models Storm Flap allows maximum sweater basket protection Zippered Storage Boot extends the life of the product Patented', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1340'),
(1341, 'Yamaha Drive/Drive2 Cabana Bag Cover - Black, Yamaha Drive', 10, 0.00, 239.00, NULL, 4, 26, 4, '2026-01-20 16:00:22.307', '2026-08-21 16:26:52.774', NULL, '/1778169231744-4544257.jpeg', NULL, 'image_4.webp', 'Designed to fit exclusively on the Yamaha Drive or Drive2 models Storm Flap allows maximum sweater basket protection Zippered Storage Boot extends the life of the product Patented', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1341'),
(1342, 'Yamaha Drive/Drive2 Cabana Bag Cover - Black, Yamaha Drive 2', 10, 0.00, 239.00, NULL, 4, 26, 4, '2026-01-20 16:00:23.314', '2026-08-21 16:26:53.692', NULL, '/1778169207005-657148759.jpeg', NULL, 'image_4.webp', 'Designed to fit exclusively on the Yamaha Drive or Drive2 models Storm Flap allows maximum sweater basket protection Zippered Storage Boot extends the life of the product Patented', 6.00, 39.00, 7.00, 27.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1342'),
(1343, '3 x 4 Yamaha G22/GPS/Advanced Enclosure', 0, 0.00, 279.00, 'Tan', 4, 25, 2, '2026-01-20 16:00:24.333', '2026-08-21 16:26:54.802', NULL, 'advanced_enclosure_tan.jpg', NULL, NULL, 'Designed to fit the Pro Link GPS top and the Yamaha G22 model golf car. MADE IN THE USA!! These tops are slightly larger than a standard size top. Patented roll-away front windshield system', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1343'),
(1344, '3 x 4 Yamaha G22/GPS/Advanced Enclosure', 0, 0.00, 279.00, 'Forest Green', 4, 25, 2, '2026-01-20 16:00:25.339', '2026-08-21 16:26:55.717', NULL, 'advanced_enclosure_forest_green.jpg', NULL, NULL, 'Designed to fit the Pro Link GPS top and the Yamaha G22 model golf car. MADE IN THE USA!! These tops are slightly larger than a standard size top. Patented roll-away front windshield system', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1344'),
(1345, '3 x 4 Yamaha Drive/Drive2 Enclosure', 14, 0.00, 279.00, 'Black', 4, 26, 2, '2026-01-20 16:00:26.337', '2026-08-21 16:26:56.637', NULL, '1777993741099-479150741.webp', NULL, NULL, 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1345'),
(1346, '3 x 4 Yamaha Drive/Drive2 Enclosure', 0, 0.00, 279.00, 'Tan', 4, 26, 2, '2026-01-20 16:00:27.348', '2026-08-21 16:26:57.562', NULL, '1777993800685-45348178.webp', '1777993800685-753254745.webp', '3-x-4-UNIVERSAL_YAMAHA_ON-BLUE-CAR_FRONT-VIEW.webp', 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1346'),
(1347, '3 x 4 Yamaha Drive/Drive2 Enclosure', 9, 0.00, 279.00, 'Forest Green', 4, 26, 2, '2026-01-20 16:00:28.577', '2026-08-21 16:26:58.479', NULL, '1777993713964-990547486.webp', NULL, NULL, 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1347'),
(1348, 'Hoodie Yamaha Drive/Drive2 Enclosure', 1, 0.00, 215.00, 'Black', 4, 26, 2, '2026-01-20 16:00:29.581', '2026-08-21 16:26:59.436', NULL, '1776959606701-810088823.webp', NULL, NULL, 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1348'),
(1349, 'Hoodie Yamaha Drive/Drive2 Enclosure', 0, 0.00, 215.00, 'Tan', 4, 26, 2, '2026-01-20 16:00:30.583', '2026-08-21 16:27:00.360', NULL, '/1778169079061-692115411.jpeg', NULL, NULL, 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1349'),
(1350, 'Hoodie Yamaha Drive/Drive2 Enclosure', 0, 0.00, 215.00, 'Forest Green', 4, 26, 2, '2026-01-20 16:00:31.589', '2026-08-21 16:27:01.283', NULL, '/1778168893646-957084577.jpeg', NULL, NULL, 'Designed to fit BOTH Drive and Drive2 Yamaha model golf cars Perfect for golf cars with windshields already in place Border edge around windshield cinches up to the windshield, much l', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1350'),
(1351, '3-sided Yamaha Drive (2006-2016)', 0, 0.00, 279.00, 'Beige', 4, 27, 2, '2026-01-20 16:00:32.805', '2026-08-21 16:27:02.209', NULL, '1777993594441-645590376.webp', NULL, NULL, 'Designed specifically for the Yamaha Drive2 golf car Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to cart bot', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1351'),
(1352, '3-sided Yamaha Drive (2006-2016)', 0, 0.00, 279.00, 'Black', 4, 27, 2, '2026-01-20 16:00:33.811', '2026-08-21 16:27:03.134', NULL, '1777993577683-627930764.webp', NULL, NULL, 'Designed specifically for the Yamaha Drive2 golf car Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to cart bot', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1352'),
(1353, '3-sided Yamaha Drive2 (2017-Present)', 0, 0.00, 279.00, 'Beige', 4, 28, 2, '2026-01-20 16:00:35.054', '2026-08-21 16:27:04.082', NULL, '1777993528611-289219076.webp', NULL, NULL, 'Designed specifically for the Yamaha Drive2 golf car Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to cart bot', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1353'),
(1354, '3-sided Yamaha Drive2 (2017-Present)', 0, 0.00, 279.00, 'Black', 4, 28, 2, '2026-01-20 16:00:36.056', '2026-08-21 16:27:05.022', NULL, '1777993474820-324507168.webp', NULL, NULL, 'Designed specifically for the Yamaha Drive2 golf car Patented extrusion system on front windshield ensures a tight and proper fit Jam Cleat bungee hooks provide a snug fit to cart bot', 6.00, 48.00, 15.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1354'),
(1355, 'Umax Hoodie Enclosure', 1, 0.00, 315.00, 'Black', 4, 29, 2, '2026-01-20 16:00:37.280', '2026-08-21 16:27:05.943', NULL, 'umax_hero_image_closed_black.png', NULL, 'umax_hero_image_closed_black.png', 'Designed to fit the All New UMAX Over-the-top design for quick install Zippered doors for easy access Roll up rear panel for air flow 3-sided design with no windshield Border e', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1355'),
(1356, 'Umax Hoodie Enclosure', 0, 0.00, 315.00, 'Beige', 4, 29, 2, '2026-01-20 16:00:38.284', '2026-08-21 16:27:06.861', NULL, 'umax_hoodie_enclosure_beige.jpg', NULL, NULL, 'Designed to fit the All New UMAX Over-the-top design for quick install Zippered doors for easy access Roll up rear panel for air flow 3-sided design with no windshield Border e', 3.00, 28.00, 15.00, 22.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1356'),
(1357, 'Sand and Speed Bottle - Yamaha Drive', 10, 0.00, 17.00, NULL, 4, 27, 3, '2026-01-20 16:00:39.297', '2026-08-21 16:27:07.785', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1357'),
(1358, 'Sand and Speed Bottle - Yamaha Drive 2', 10, 0.00, 17.00, NULL, 4, 28, 3, '2026-01-20 16:00:40.308', '2026-08-21 16:27:08.701', 'SAND-AND-SPEED_FOR-GALLERY-copy_2.webp', 'SAND-AND-SPEED-copy.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_1.webp', 'SAND-AND-SPEED_FOR-GALLERY-copy_3.webp', 'Push-button release for quick refill No threads or clasps to attach the top Integrated parts cannot be lost Beach shovel shape for easy fill with one hand Replenishment time drast', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1358'),
(1359, 'Quiksand Bottle - Yamaha Drive', 15, 0.00, 17.00, NULL, 4, 27, 3, '2026-01-20 16:00:41.303', '2026-08-21 16:27:09.615', NULL, 'quiksand_limage_1.webp', NULL, NULL, '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1359'),
(1360, 'Quiksand Bottle - Yamaha Drive 2', 13, 0.00, 17.00, NULL, 4, 28, 3, '2026-01-20 16:00:42.305', '2026-08-21 16:27:10.715', NULL, 'quiksand_limage_1.webp', NULL, '/1780402216049-225645750.png', '54oz capacity for extended use Handle and body grips for a secure and comfortable hold Angled opening for controlling and directing flow into divot Unbreakable for ultra-durability w', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1360'),
(1361, 'Divot Station - Yamaha - Yamaha Drive', 14, 0.00, 85.00, NULL, 4, 27, 3, '2026-01-20 16:00:43.319', '2026-08-21 16:27:11.636', NULL, 'image_1-scaled.webp', NULL, 'image_2-scaled.webp', 'Everything needed to repair divot and clean your iron in one spot Compact design places two of our Quiksand Bottles and one Iron Maid club cleaner on one bracket. Easy install using exi', 8.00, 20.00, 5.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1361'),
(1362, 'Divot Station - Yamaha - Yamaha Drive 2', 17, 0.00, 85.00, NULL, 4, 28, 3, '2026-01-20 16:00:44.511', '2026-08-21 16:27:12.552', NULL, 'image_1-scaled.webp', NULL, 'image_2-scaled.webp', 'Everything needed to repair divot and clean your iron in one spot Compact design places two of our Quiksand Bottles and one Iron Maid club cleaner on one bracket. Easy install using exi', 8.00, 20.00, 5.00, 12.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1362'),
(1363, 'Quiksand Dual Bottle Kit - Yamaha Drive', 14, 0.00, 48.00, NULL, 4, 27, 3, '2026-01-20 16:00:45.507', '2026-08-21 16:27:13.480', NULL, 'dual_bottle_yamaha-scaled.webp', NULL, NULL, 'Compact design places two Quicksand Bottles on one bracket for side mounting Easy install using existing factory hole on the cart, no drilling required Sturdy powder coated steel bracke', 7.00, 13.00, 2.00, 7.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'DUMMY-SKU-1363'),
(1364, 'Quiksand Dual Bottle Kit - Yamaha Drive 2', 17, 0.00, 48.00, NULL, 4, 28, 3, '2026-01-20 16:00:46.505', '2026-09-01 12:15:57.688', NULL, 'dual_bottle_yamaha-scaled.webp', NULL, NULL, 'Compact design places two Quicksand Bottles on one bracket for side mounting Easy install using existing factory hole on the cart, no drilling required Sturdy powder coated steel bracke', 7.00, 13.00, 2.00, 7.00, 'quiksand-dual-bottle-kit des', 'quiksand-dual-bottle-kit', 'quiksand-dual-bottle-kit', 'quiksand-dual-bottle-kit', NULL, NULL, NULL, NULL, NULL, 'CPG-0095');

-- --------------------------------------------------------

--
-- Table structure for table `ProductType`
--

CREATE TABLE `ProductType` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ProductType`
--

INSERT INTO `ProductType` (`id`, `name`) VALUES
(4, 'Accessories'),
(2, 'Enclosure'),
(3, 'Hard Goods'),
(1, 'Soft Goods');

-- --------------------------------------------------------

--
-- Table structure for table `savedBuilds`
--

CREATE TABLE `savedBuilds` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `productIds` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`productIds`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `StatsCards`
--

CREATE TABLE `StatsCards` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `createdAt` datetime(3) DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `imageUrl` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `StatsCards`
--

INSERT INTO `StatsCards` (`id`, `title`, `value`, `createdAt`, `updatedAt`, `link`, `imageUrl`) VALUES
(1, 'Industry Leading Enclosure Warranty', '5 Year Warranty – Register Your Product Now!', '2026-02-09 14:39:40.597', '2026-03-26 14:20:12.391', NULL, '/uploads/stats-cards/1774526814426-978538880.png'),
(2, 'Volume Pricing Available', 'Contact us about outfitting your fleet!', '2026-02-09 14:42:25.644', '2026-03-26 14:38:03.309', NULL, '/uploads/stats-cards/1774535883305-295167478.png'),
(3, ' International Shipping Available', 'Let us know where you need it to go!', '2026-02-09 14:45:15.587', '2026-03-26 14:38:13.749', NULL, '/uploads/stats-cards/1774535893746-938162838.png'),
(5, 'Don\'t see your model cart?', 'Ask us about Made to Order program', '2026-02-09 15:02:37.525', '2026-03-26 14:39:53.641', '', '/uploads/stats-cards/1774535993637-422958020.png');

-- --------------------------------------------------------

--
-- Table structure for table `VerificationCode`
--

CREATE TABLE `VerificationCode` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `code` varchar(191) NOT NULL,
  `isForReset` tinyint(1) NOT NULL DEFAULT 0,
  `expiry` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `VerificationCode`
--

INSERT INTO `VerificationCode` (`id`, `customerId`, `phone`, `code`, `isForReset`, `expiry`, `createdAt`) VALUES
(1, 40, NULL, '516424', 1, '2026-02-12 07:41:14.841', '2026-02-12 07:31:14.842'),
(2, 40, NULL, '440991', 1, '2026-02-12 07:53:22.623', '2026-02-12 07:43:22.625'),
(3, 40, NULL, '254076', 1, '2026-02-12 07:54:52.362', '2026-02-12 07:44:52.364'),
(5, 40, NULL, '666595', 1, '2026-02-12 08:07:03.716', '2026-02-12 07:57:03.717'),
(6, 40, NULL, '795753', 1, '2026-02-12 08:08:21.135', '2026-02-12 07:58:21.136'),
(15, 41, NULL, '801732', 1, '2026-05-05 10:22:08.626', '2026-05-05 10:12:08.627'),
(16, 40, NULL, '167958', 1, '2026-05-05 10:23:22.805', '2026-05-05 10:13:22.806'),
(17, 40, NULL, '334886', 1, '2026-05-05 10:25:38.114', '2026-05-05 10:15:38.115'),
(18, 40, NULL, '610194', 1, '2026-05-05 10:28:19.835', '2026-05-05 10:18:19.836'),
(19, 41, NULL, '848929', 1, '2026-05-05 10:29:01.118', '2026-05-05 10:19:01.118'),
(20, 41, NULL, '882071', 1, '2026-05-05 10:37:10.026', '2026-05-05 10:27:10.041'),
(21, 40, NULL, '109446', 1, '2026-05-05 10:37:59.058', '2026-05-05 10:27:59.073'),
(22, 40, NULL, '638972', 1, '2026-05-05 10:40:41.196', '2026-05-05 10:30:41.204'),
(23, 40, NULL, '135858', 1, '2026-05-05 10:42:10.243', '2026-05-05 10:32:10.245'),
(24, 41, NULL, '906777', 1, '2026-05-05 10:43:00.475', '2026-05-05 10:33:00.477'),
(25, 40, NULL, '999582', 1, '2026-05-05 11:53:23.865', '2026-05-05 11:43:23.875'),
(26, 40, NULL, '616825', 1, '2026-05-05 11:54:59.922', '2026-05-05 11:44:59.924'),
(27, 41, NULL, '910980', 1, '2026-05-05 11:55:46.839', '2026-05-05 11:45:46.840'),
(28, 41, NULL, '194633', 1, '2026-05-05 11:57:52.651', '2026-05-05 11:47:52.652'),
(29, 41, NULL, '381991', 1, '2026-05-05 11:59:42.177', '2026-05-05 11:49:42.182'),
(31, 40, NULL, '689226', 1, '2026-05-05 12:08:27.182', '2026-05-05 11:58:27.194'),
(32, 40, NULL, '481443', 1, '2026-05-05 12:09:13.720', '2026-05-05 11:59:13.723'),
(35, 40, NULL, '405909', 1, '2026-05-05 14:47:23.343', '2026-05-05 14:37:23.344'),
(36, 40, NULL, '432295', 1, '2026-05-05 14:47:28.350', '2026-05-05 14:37:28.351'),
(38, 44, NULL, '342085', 1, '2026-05-05 15:52:07.317', '2026-05-05 15:42:07.318'),
(39, 44, NULL, '225223', 1, '2026-05-05 15:55:30.144', '2026-05-05 15:45:30.145');

-- --------------------------------------------------------

--
-- Table structure for table `Warranty`
--

CREATE TABLE `Warranty` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `model` varchar(255) NOT NULL,
  `purchase` datetime(3) NOT NULL,
  `discount` tinyint(1) NOT NULL DEFAULT 0,
  `registeredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT NULL,
  `customerId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Warranty`
--

INSERT INTO `Warranty` (`id`, `name`, `address`, `email`, `phone`, `model`, `purchase`, `discount`, `registeredAt`, `createdAt`, `updatedAt`, `customerId`) VALUES
(1, 'name', 'abc', 'abc@gmal.com', '2323232', 'abc', '2026-02-07 00:00:00.000', 1, '2026-02-07 14:59:42.522', '2026-02-07 14:59:43.300', '2026-02-07 14:59:43.300', NULL),
(2, 'name', 'abc', 'abc@gmal.com', '2323232', 'abc', '2026-02-07 00:00:00.000', 1, '2026-02-09 05:42:47.171', '2026-02-09 05:42:48.179', '2026-02-09 05:42:48.179', NULL),
(3, 'Yvette Grimes', 'Vero inventore volup', 'heserad@mailinator.com', '+1 (178) 161-1803', 'Autem expedita non n', '2026-02-11 00:00:00.000', 1, '2026-02-09 06:01:27.943', '2026-02-09 06:01:28.724', '2026-02-09 06:01:28.724', NULL),
(4, 'Alfonso Holman', 'Reprehenderit nobis', 'yamanaamir2004@gmail.com', '+1 (376) 113-4441', 'Sed consequatur Dis', '2016-07-05 00:00:00.000', 1, '2026-02-09 15:40:38.271', '2026-02-09 15:40:39.046', '2026-02-09 15:40:39.046', NULL),
(5, 'Alfonso Holman', 'Reprehenderit nobis', 'yamanaamir2004@gmail.com', '+1 (376) 113-4441', 'Sed consequatur Dis', '2016-07-05 00:00:00.000', 1, '2026-02-09 15:48:26.260', '2026-02-09 15:48:27.022', '2026-02-09 15:48:27.022', NULL),
(6, 'yaman', 'saddar', 'yamanaamir2004@gmail.com', '0121981271', 'black 2020', '2020-02-09 00:00:00.000', 1, '2026-02-09 15:50:32.823', '2026-02-09 15:50:32.825', '2026-02-09 15:50:32.825', NULL),
(7, 'Steven Prehoda', '66 Birch St', 'sprehoda@gmail.com', '5167295992', 'CartCovers Test Warranty', '2026-06-12 00:00:00.000', 1, '2026-06-16 13:31:03.392', '2026-06-16 13:31:03.409', '2026-06-16 13:31:03.409', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('03240d29-8730-44f5-a0f5-3889a68ac6e8', 'f3d2806d48a16eb0756ff01628cab0ca05f3edce56790cb7b754fca149f347bc', '2026-01-19 13:03:35.569', '006_some_change', NULL, NULL, '2026-01-19 13:03:34.550', 1),
('06a4398f-acb4-4112-baa8-9dfcdaec2d06', 'e69c9f21be2b53770b13ea52bf6c4f304a9fc86b41f1e932729ec2de45574341', '2026-01-19 13:15:24.671', '007_some_change', NULL, NULL, '2026-01-19 13:15:23.736', 1),
('2634086d-47c2-4483-aa35-0664b71f5c89', 'a5543fb8a4603a654408d4fb941123d20ce534b1bec55fda35f600b503b1da4b', '2026-01-20 12:32:14.679', '010_some_change', NULL, NULL, '2026-01-20 12:32:13.710', 1),
('2ef92eab-bbe1-472b-a196-b0ae7f25c3c3', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-01-20 11:59:39.604', '009_some_change', '', NULL, '2026-01-20 11:59:39.604', 0),
('363d7fd3-55e9-451f-b4df-ff510d06e653', 'e56f1b288c3cfc852b63c07f36906f964f78f473f99bd2eff3d83dd25c75add4', '2026-01-20 14:52:49.570', '011_some_change', NULL, NULL, '2026-01-20 14:52:48.580', 1),
('42da91d6-5fdc-49db-800b-2fbb1992501c', '143485c0a2278a9ad1531e27fe75b8a02d87279cfcf0cff4d1a4cafefd920e42', '2026-01-09 13:49:11.268', '004_some_change', NULL, NULL, '2026-01-09 13:49:10.301', 1),
('4b929063-0549-406c-873c-a41fc5b3a4c2', '5c414fec91f9565f4ee56b6c58777267adfd4eeb323cd90cf399cab85af25003', '2026-01-09 11:44:55.038', '000_init', '', NULL, '2026-01-09 11:44:55.038', 0),
('6a770474-fea4-42ad-9659-bd1e5562cee9', '143485c0a2278a9ad1531e27fe75b8a02d87279cfcf0cff4d1a4cafefd920e42', '2026-01-09 13:44:41.775', '003_some_change', '', NULL, '2026-01-09 13:44:41.775', 0),
('7099f7da-6484-4811-bfb9-a1ecf8589b24', '403defcbe77505d91c8532065f8fc1c7ad931b22de6ba8717de77be1c5d9e55b', '2026-01-14 10:58:04.665', '005_some_change', NULL, NULL, '2026-01-14 10:58:03.679', 1),
('7cdbb9b3-2387-4755-8e5c-87b540710a3c', 'e5a8f01e3652d89843c096ff6ac6332570fe0a2f2d2b7c3544c1179c14d28fb2', '2026-01-09 11:57:57.225', '002_some_change', NULL, NULL, '2026-01-09 11:57:56.257', 1),
('874a62c8-1e2a-4499-bc1d-941e0204a0cb', '61979ee979dac476949f411dd2a931a0247bc5c6353ca10127f5f08f2bb7a316', '2026-01-19 17:36:39.548', '008_some_change', NULL, NULL, '2026-01-19 17:36:38.560', 1),
('e170f2f5-7e01-4608-a48d-74676b42f82c', 'b9e4f95612fe77f25477e2b83e939b36b9ee158dfe459ad810d6894bcd02be44', NULL, '003_some_change', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 003_some_change\n\nDatabase error code: 1062\n\nDatabase error:\nDuplicate entry \'3-Sided Precedent Enclosure-1-17-2\' for key \'Product_name_brandId_modelId_typeId_key\'\n\nPlease check the query number 2 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"003_some_change\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"003_some_change\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:236', '2026-01-09 13:44:41.390', '2026-01-09 12:32:45.048', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `Brand`
--
ALTER TABLE `Brand`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Brand_name_key` (`name`),
  ADD UNIQUE KEY `Brand_slug_key` (`slug`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `customers_fishbowlCustomerNumber_key` (`fishbowlCustomerNumber`);

--
-- Indexes for table `DealerRegistration`
--
ALTER TABLE `DealerRegistration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DealerRegistration_email_key` (`email`);

--
-- Indexes for table `HeroSection`
--
ALTER TABLE `HeroSection`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Model`
--
ALTER TABLE `Model`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Model_name_brandId_key` (`name`,`brandId`),
  ADD UNIQUE KEY `Model_slug_key` (`slug`),
  ADD KEY `Model_brandId_fkey` (`brandId`);

--
-- Indexes for table `Order`
--
ALTER TABLE `Order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Order_customerId_idx` (`customerId`);

--
-- Indexes for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_idx` (`orderId`),
  ADD KEY `OrderItem_productId_idx` (`productId`);

--
-- Indexes for table `PageSeo`
--
ALTER TABLE `PageSeo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PageSeo_pageName_key` (`pageName`),
  ADD UNIQUE KEY `PageSeo_slug_key` (`slug`);

--
-- Indexes for table `PasswordResetAttempt`
--
ALTER TABLE `PasswordResetAttempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PasswordResetAttempt_customerId_idx` (`customerId`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_name_brandId_modelId_typeId_color_key` (`name`,`brandId`,`modelId`,`typeId`,`color`),
  ADD UNIQUE KEY `Product_slug_key` (`slug`),
  ADD UNIQUE KEY `Product_fishbowlPartNumber_key` (`fishbowlPartNumber`),
  ADD UNIQUE KEY `Product_sku_key` (`sku`),
  ADD KEY `Product_brandId_idx` (`brandId`),
  ADD KEY `Product_modelId_idx` (`modelId`),
  ADD KEY `Product_typeId_idx` (`typeId`);

--
-- Indexes for table `ProductType`
--
ALTER TABLE `ProductType`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductType_name_key` (`name`);

--
-- Indexes for table `savedBuilds`
--
ALTER TABLE `savedBuilds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `savedBuilds_customerId_fkey` (`customerId`);

--
-- Indexes for table `StatsCards`
--
ALTER TABLE `StatsCards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `VerificationCode`
--
ALTER TABLE `VerificationCode`
  ADD PRIMARY KEY (`id`),
  ADD KEY `VerificationCode_customerId_idx` (`customerId`);

--
-- Indexes for table `Warranty`
--
ALTER TABLE `Warranty`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Warranty_email_idx` (`email`),
  ADD KEY `Warranty_customerId_fkey` (`customerId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Brand`
--
ALTER TABLE `Brand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `DealerRegistration`
--
ALTER TABLE `DealerRegistration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `HeroSection`
--
ALTER TABLE `HeroSection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `Model`
--
ALTER TABLE `Model`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `Order`
--
ALTER TABLE `Order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `OrderItem`
--
ALTER TABLE `OrderItem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `PageSeo`
--
ALTER TABLE `PageSeo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `PasswordResetAttempt`
--
ALTER TABLE `PasswordResetAttempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1402;

--
-- AUTO_INCREMENT for table `ProductType`
--
ALTER TABLE `ProductType`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `savedBuilds`
--
ALTER TABLE `savedBuilds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `StatsCards`
--
ALTER TABLE `StatsCards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `VerificationCode`
--
ALTER TABLE `VerificationCode`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `Warranty`
--
ALTER TABLE `Warranty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Model`
--
ALTER TABLE `Model`
  ADD CONSTRAINT `Model_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Order`
--
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `PasswordResetAttempt`
--
ALTER TABLE `PasswordResetAttempt`
  ADD CONSTRAINT `PasswordResetAttempt_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Product`
--
ALTER TABLE `Product`
  ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `Model` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `ProductType` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `savedBuilds`
--
ALTER TABLE `savedBuilds`
  ADD CONSTRAINT `savedBuilds_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `VerificationCode`
--
ALTER TABLE `VerificationCode`
  ADD CONSTRAINT `VerificationCode_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Warranty`
--
ALTER TABLE `Warranty`
  ADD CONSTRAINT `Warranty_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
