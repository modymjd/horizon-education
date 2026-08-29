-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 29, 2026 at 07:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `horizon_education`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_codes`
--

CREATE TABLE `access_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `code_prefix` varchar(10) DEFAULT NULL,
  `status` enum('new','used','expired','cancelled') DEFAULT 'new',
  `single_use` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `assigned_student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `used_by_student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `used_device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`used_device_info`)),
  `created_by_teacher_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` char(36) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `access_codes`
--

INSERT INTO `access_codes` (`id`, `lesson_id`, `code_hash`, `code_prefix`, `status`, `single_use`, `expires_at`, `assigned_student_id`, `used_by_student_id`, `used_at`, `used_device_info`, `created_by_teacher_id`, `batch_id`, `cancelled_at`, `created_at`) VALUES
(1, 1, 'a2501737042c6d5ad3ad2d63dc809f93cc07072ffb537c531a3da5d90c662865', 'HZ-X3', 'new', 1, '2026-08-02 21:00:00', NULL, NULL, NULL, NULL, 2, 'bdaOhb3q99YR89qoSQbOZ', NULL, '2026-08-01 21:09:14'),
(2, 1, '287194fb9a46ace1b9e2b7d46392da5804baa8cff291c86390fa632271091c39', 'HZ-I3', 'new', 1, '2026-08-02 21:00:00', NULL, NULL, NULL, NULL, 2, 'bdaOhb3q99YR89qoSQbOZ', NULL, '2026-08-01 21:09:14'),
(3, 1, '30f3ae3ce2134b0fa3b72ae73c407af889e2d9ed8e4a321d7a187d75035bcc5f', 'HZ-OI', 'new', 1, '2026-08-02 21:00:00', NULL, NULL, NULL, NULL, 2, 'bdaOhb3q99YR89qoSQbOZ', NULL, '2026-08-01 21:09:14'),
(4, 1, '7bae5b0274b63a5aa727b96ebb9ecfb28f85f841f4a52ea966e527e2c193301f', 'HZ-UJ', 'new', 1, '2026-08-02 21:00:00', NULL, NULL, NULL, NULL, 2, 'bdaOhb3q99YR89qoSQbOZ', NULL, '2026-08-01 21:09:14'),
(5, 1, '91242ac9c5ec4af2fe7cb6bac3c62ab089919b169d0cf4ffa1f04a5534d0028b', 'HZ-RH', 'used', 1, '2026-08-02 21:00:00', NULL, 1, '2026-08-01 21:16:33', NULL, 2, 'bdaOhb3q99YR89qoSQbOZ', NULL, '2026-08-01 21:09:14'),
(6, 3, 'cf10ff0d903ee559a087949a0d76f116e4a8b1fe47b58b747097cf7d7fa8c5f4', 'HZ-W9', 'used', 1, NULL, NULL, 3, '2026-08-11 20:23:38', NULL, 2, 'w9npC-BkJTDQZ1JB5XJDE', NULL, '2026-08-11 20:22:59'),
(14, 5, 'fcde42be7f4f8cf7f9dd002dba33d5160b824b2f77984da93e143686691a0ab1', 'HZ-DP', 'used', 1, '2027-02-01 22:00:00', NULL, 3, '2026-08-11 20:56:30', NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(15, 5, '5013e4911ab527564080f919cbfac1467a42d42564cdee2f6f1c26de3f4d1882', 'HZ-FH', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(16, 5, '34a24a384e049f5e898b70cdb630ae98ce4e2897f2ed1f0d77a18ac2d92522ae', 'HZ-DG', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(17, 5, '9d703c99997c30872f036cbe3597efc551a7de162a508cad31359b791b8b1920', 'HZ-EP', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(18, 5, '420e81d3d715c71088efa8c315816e0411e67f07014cd0bd5f0bd6b6032f3b64', 'HZ-G6', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(19, 5, '0a355fca560443b5793b1429a9455aa3916e9a65519c5c74ea2a1026ab5f262e', 'HZ-IK', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(20, 5, 'b41ae628a8d7e41fbe1f44331e1a59d67bc2bb031712c559679467f31aaf0d55', 'HZ-IX', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(21, 5, '542872de87b8ffa993abb63cc211101c93013a549ccbd3bcf0e58fb8898b0411', 'HZ-4O', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(22, 5, '3c89d8729c7e4928fb7cf02b06a8d7ac5be4ff431c6f5cd6ddd9bf1a96cc256e', 'HZ-BV', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(23, 5, 'a4d1f6ad6cd340678a7c124f595076fd0d3f24f7d46eb1a2fc16151fea891081', 'HZ-GH', 'new', 1, '2027-02-01 22:00:00', NULL, NULL, NULL, NULL, 5, 'p6UG5Dg3oTT0jI0Za-V9z', NULL, '2026-08-11 20:54:45'),
(24, 6, '7bc6320bde33ee16649fc7061add946d0a832d999254b088b8db6c51e336efdb', 'HZ-JC', 'used', 1, '2026-08-19 21:00:00', NULL, 4, '2026-08-13 23:17:59', NULL, 6, '4BPmC7jPcSB6fmt0G3IyZ', NULL, '2026-08-13 23:16:52'),
(25, 7, '7a4d352f57c4384fa7a6fd784fb97a88ff8d18b136afe6ea439a9d09696a1c2d', 'HZ-Q1', 'used', 1, '2026-12-11 22:00:00', NULL, 4, '2026-08-14 14:49:48', NULL, 6, '43k8_7HaGmkwVCsRaEXVJ', NULL, '2026-08-14 14:49:24'),
(26, 7, 'e0156c598b453d63792235d44e2b60473efe2a1c700f9465e1584e29206ea737', 'HZ-ZL', 'new', 1, '2026-08-21 21:00:00', NULL, NULL, NULL, NULL, 6, 'UW98UTZxGYRiRalYNRNu0', NULL, '2026-08-19 00:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `account_blocks`
--

CREATE TABLE `account_blocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `block_type` enum('permanent','temporary') NOT NULL,
  `reason` text DEFAULT NULL,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `blocked_by` bigint(20) UNSIGNED NOT NULL,
  `unblocked_at` timestamp NULL DEFAULT NULL,
  `unblocked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `chapter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `total_marks` decimal(8,2) DEFAULT 100.00,
  `max_attempts` tinyint(4) DEFAULT 1,
  `starts_at` timestamp NULL DEFAULT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `allow_pdf` tinyint(1) DEFAULT 1,
  `allow_image` tinyint(1) DEFAULT 1,
  `allow_other` tinyint(1) DEFAULT 0,
  `max_file_size_mb` tinyint(4) DEFAULT 10,
  `auto_grade` tinyint(1) DEFAULT 0,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `assignment_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `attempt_number` tinyint(4) DEFAULT 1,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('submitted','reviewed','graded') DEFAULT 'submitted',
  `score` decimal(8,2) DEFAULT NULL,
  `teacher_comment` text DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `file_url` varchar(1000) NOT NULL,
  `file_type` enum('pdf','word','image','video','other') DEFAULT 'other',
  `file_size_kb` int(10) UNSIGNED DEFAULT NULL,
  `allow_download` tinyint(1) DEFAULT 0,
  `available_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `lesson_id`, `title`, `description`, `file_url`, `file_type`, `file_size_kb`, `allow_download`, `available_until`) VALUES
(1, 2, ' ملخص أساسيات النحو', 'ملف PDF يحتوي على ملخص الدرس الأول.', 'https://example.com/files/nahw-summary.pdf', 'pdf', 800, 0, '2026-07-31 21:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `attended_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(200) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 4, 'create_teacher', 'teacher', 4, NULL, '{\"email\": \"mahmoud.teacher@test.com\", \"full_name\": \"أ. محمود علي\"}', NULL, NULL, '2026-07-28 22:57:28'),
(2, 1, 'create_course', 'course', 2, NULL, '{\"title\": \"اللغة العربية للثانوية العامة\", \"teacher_id\": 2}', NULL, NULL, '2026-07-28 23:13:28'),
(3, 1, 'create_chapter', 'chapter', 2, NULL, '{\"title\": \"الوحدة الأولى — المقدمة\", \"course_id\": 2}', NULL, NULL, '2026-07-28 23:35:03'),
(4, 1, 'create_lesson', 'lesson', 2, NULL, '{\"title\": \" اساسيات النحو\", \"chapter_id\": 2, \"price\": 500}', NULL, NULL, '2026-07-29 00:46:10'),
(5, 1, 'create_lesson_video', 'lesson_video', 1, NULL, '{\"title\": \" ملخص أساسيات النحو\", \"lesson_id\": 2}', NULL, NULL, '2026-07-29 01:40:05'),
(6, 1, 'create_lesson_attachment', 'attachment', 1, NULL, '{\"title\": \" ملخص أساسيات النحو\", \"lesson_id\": 2}', NULL, NULL, '2026-07-29 01:40:59'),
(7, 1, 'create_lesson_video', 'lesson_video', 2, NULL, '{\"title\": \"مقدمة الاساسيات النحوية\", \"lesson_id\": 2}', NULL, NULL, '2026-07-30 16:22:49'),
(8, 1, 'create_lesson_video', 'lesson_video', 3, NULL, '{\"title\": \" fgbf\", \"lesson_id\": 2}', NULL, NULL, '2026-07-30 17:03:01'),
(9, 1, 'create_lesson_video', 'lesson_video', 4, NULL, '{\"title\": \"fgd\", \"lesson_id\": 2}', NULL, NULL, '2026-07-30 17:35:48'),
(10, 8, 'create_teacher', 'teacher', 8, NULL, '{\"email\": \"sherif@gmail.com\", \"full_name\": \"د. شريف صاير نديب\"}', NULL, NULL, '2026-08-01 20:31:23'),
(11, 9, 'create_teacher', 'teacher', 13, NULL, '{\"email\": \"saadhamada1@gmail.com\", \"full_name\": \"مستر سعد حمادة\"}', NULL, NULL, '2026-08-13 21:30:30'),
(12, 1, 'create_course', 'course', 5, NULL, '{\"title\": \"\\u0627\\u0644\\u0644\\u063A\\u0629 \\u0627\\u0644\\u0627\\u0646\\u062C\\u0644\\u064A\\u0632\\u064A\\u0629 \", \"teacher_id\": 6, \"education_type_id\": 3, \"stage_id\": null, \"grade_id\": 3}', NULL, NULL, '2026-08-13 22:00:46'),
(13, 1, 'create_course', 'course', 6, NULL, '{\"title\": \"\\u0627\\u0644\\u0644\\u063A\\u0629 \\u0627\\u0644\\u0627\\u0646\\u062C\\u0644\\u064A\\u0632\\u064A\\u0629 \\u062B\\u0627\\u0646\\u0648\\u064A\\u0629\", \"teacher_id\": 6, \"education_type_id\": 3, \"stage_id\": null, \"grade_id\": null}', NULL, NULL, '2026-08-13 22:27:21'),
(14, 13, 'review_course_request', 'student_course_request', 1, NULL, '{\"status\": \"accepted\"}', NULL, NULL, '2026-08-13 22:53:01'),
(15, 9, 'delete_course', 'course', 6, NULL, '{\"deleted\": true}', NULL, NULL, '2026-08-13 23:20:05'),
(16, 9, 'create_chapter', 'chapter', 7, NULL, '{\"title\": \"الوحدة التانية\", \"course_id\": 5}', NULL, NULL, '2026-08-14 14:15:50'),
(17, 9, 'suspend_student', 'student', 3, NULL, '{\"status\": \"suspended\"}', NULL, NULL, '2026-08-14 14:50:46'),
(18, 9, 'activate_student', 'student', 3, NULL, '{\"status\": \"active\"}', NULL, NULL, '2026-08-14 14:50:50'),
(19, 9, 'suspend_student', 'student', 12, NULL, '{\"status\": \"suspended\"}', NULL, NULL, '2026-08-14 14:50:53'),
(20, 1, 'activate_student', 'student', 12, NULL, '{\"status\": \"active\"}', NULL, NULL, '2026-08-14 14:51:36'),
(21, 1, 'delete_student', 'student', 3, NULL, '{\"deleted\": true}', NULL, NULL, '2026-08-14 14:51:41'),
(22, 9, 'create_payment', 'payment', 3, NULL, '{\"invoice_number\": \"INV-2026-XGUF4J8P\", \"amount_paid\": 100}', NULL, NULL, '2026-08-16 16:01:10'),
(23, 13, 'create_payment', 'payment', 4, NULL, '{\"invoice_number\": \"INV-2026-FDY86IUI\", \"amount_paid\": 198, \"recorded_by_teacher\": true}', NULL, NULL, '2026-08-29 17:14:39');

-- --------------------------------------------------------

--
-- Table structure for table `chapters`
--

CREATE TABLE `chapters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `sort_order` smallint(6) DEFAULT 0,
  `status` enum('draft','published','hidden') DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chapters`
--

INSERT INTO `chapters` (`id`, `course_id`, `title`, `description`, `cover_image_url`, `sort_order`, `status`, `published_at`, `deleted_at`) VALUES
(1, 1, 'الجبر — البداية', 'مقدمة في أساسيات الجبر', NULL, 1, 'published', '2026-07-28 20:42:16', NULL),
(2, 2, 'الوحدة الأولى — المقدمة', 'بداية الكورس والمفاهيم الأساسية', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9F99vEVt3VVVvoSwfuaA1g_K1PzvHOn2V61LR_kpp2Q&s=10', 1, 'published', NULL, NULL),
(3, 1, 'الجبر — البداية', 'مقدمة في أساسيات الجبر', NULL, 1, 'published', '2026-08-01 18:27:05', NULL),
(4, 4, 'الفصل الأول', 'فصل تجريبي للاختبار', NULL, 1, 'published', '2026-08-11 19:25:39', NULL),
(5, 5, 'الفصل الأول', 'فصل افتراضي لبدء إضافة الحصص', NULL, 1, 'published', '2026-08-13 22:00:46', NULL),
(6, 6, 'الفصل الأول', 'فصل افتراضي لبدء إضافة الحصص', NULL, 1, 'published', '2026-08-13 22:27:21', NULL),
(7, 5, 'الوحدة التانية', 'شرح القصة والوحدة التانية و الجرامر ', NULL, 2, 'published', '2026-08-14 11:15:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `education_type_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `stage_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `grade_id` smallint(5) UNSIGNED DEFAULT NULL,
  `status` enum('draft','published','paused','ended') DEFAULT 'draft',
  `starts_at` date DEFAULT NULL,
  `ends_at` date DEFAULT NULL,
  `access_duration_days` smallint(6) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `slug`, `title`, `short_description`, `description`, `cover_image_url`, `teacher_id`, `education_type_id`, `stage_id`, `grade_id`, `status`, `starts_at`, `ends_at`, `access_duration_days`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'math-grade-one', 'الرياضيات للصف الأول الثانوي', 'كورس تأسيسي مبسط في الرياضيات', 'شرح منظم للحصص مع واجبات واختبارات ومتابعة نتائج.', NULL, 1, 1, NULL, NULL, 'published', '2026-07-28', '2026-10-26', 30, 1, '2026-07-28 20:42:16', '2026-07-28 20:42:16', NULL),
(2, 'اللغة-العربية-للثانوية-العامة-1785280408463', 'اللغة العربية للثانوية العامة', 'كورس شامل في اللغة العربية', 'شرح منهجي مع تدريبات وواجبات واختبارات دورية واصول النحو و البلاغة  العامة و الادب العربي و الشعر الفاطمي', NULL, 2, 1, NULL, NULL, 'published', '2026-07-29', '2026-10-29', 30, 1, '2026-07-28 23:13:28', '2026-07-28 23:13:28', NULL),
(4, 'test-math-course', 'كورس رياضيات تجريبي', 'كورس للاختبار الداخلي', 'هذا الكورس مخصص لاختبار صفحات الطالب والمدرس والأدمن.', NULL, 5, 1, NULL, NULL, 'published', NULL, NULL, 30, 10, '2026-08-11 19:25:39', '2026-08-11 19:25:39', NULL),
(5, 'اللغة-الانجليزية-1786658446439', 'اللغة الانجليزية ', 'كورس اللغة الانجليزية للصف التالت الثانوي ', 'كورس اللغة الانجليزية للصف التالت الثانوي  يتضمن شرح الجرامر و الافعال وتصريفات والقصة ', 'https://fluencycorp.com/wp-content/uploads/2026/04/learn-english.jpeg', 6, 3, 18, 71, 'published', NULL, NULL, 145, 1, '2026-08-13 22:00:46', '2026-08-28 22:07:33', NULL),
(6, 'اللغة-الانجليزية-ثانوية-1786660041762', 'اللغة الانجليزية ثانوية', 'اللغة الانجليزية للثانوية العامة', 'اللغة الانجليزية للثانوية العامة شرح جراتمر و قصة ونوصوص وافعال', 'https://fluencycorp.com/wp-content/uploads/2026/04/learn-english.jpeg', 6, 3, NULL, NULL, 'published', NULL, NULL, 160, 1, '2026-08-13 22:27:21', '2026-08-13 23:20:05', '2026-08-13 23:20:05');

-- --------------------------------------------------------

--
-- Table structure for table `course_education_types`
--

CREATE TABLE `course_education_types` (
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `education_type_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_education_types`
--

INSERT INTO `course_education_types` (`course_id`, `education_type_id`) VALUES
(1, 1),
(2, 1),
(4, 1),
(5, 3),
(6, 3);

-- --------------------------------------------------------

--
-- Table structure for table `course_stages`
--

CREATE TABLE `course_stages` (
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `stage_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `educational_stages`
--

CREATE TABLE `educational_stages` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `educational_stages`
--

INSERT INTO `educational_stages` (`id`, `name`, `sort_order`) VALUES
(1, 'Primary', 1),
(11, 'Preparatory', 2),
(18, 'Secondary', 3);

-- --------------------------------------------------------

--
-- Table structure for table `education_types`
--

CREATE TABLE `education_types` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `education_types`
--

INSERT INTO `education_types` (`id`, `name`, `slug`) VALUES
(1, 'General / Arabic', 'general'),
(2, 'Azhari', 'azhari'),
(3, 'Languages', 'languages'),
(4, 'International', 'international'),
(5, 'Technical', 'technical'),
(8, 'American', 'american'),
(9, 'IG', 'ig'),
(10, 'IB', 'ib'),
(11, 'STEM', 'stem');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED DEFAULT NULL,
  `chapter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` text DEFAULT NULL,
  `total_marks` decimal(8,2) NOT NULL DEFAULT 100.00,
  `passing_marks` decimal(8,2) NOT NULL DEFAULT 50.00,
  `duration_minutes` smallint(5) UNSIGNED NOT NULL DEFAULT 60,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `randomize_questions` tinyint(1) DEFAULT 0,
  `randomize_choices` tinyint(1) DEFAULT 0,
  `show_result_after` tinyint(1) DEFAULT 1,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exam_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `score` decimal(8,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `status` enum('in_progress','submitted','timed_out') DEFAULT 'in_progress',
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`device_info`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_questions`
--

CREATE TABLE `exam_questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exam_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `marks` decimal(6,2) DEFAULT 1.00,
  `sort_order` smallint(6) DEFAULT 0,
  `explanation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `stage_id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `stage_id`, `name`, `sort_order`) VALUES
(1, 1, 'Grade 1', 1),
(8, 11, 'Grade 1', 1),
(9, 18, 'Grade 1', 1),
(35, 1, 'Grade 2', 2),
(39, 11, 'Grade 2', 2),
(40, 18, 'Grade 2', 2),
(66, 1, 'Grade 3', 3),
(70, 11, 'Grade 3', 3),
(71, 18, 'Grade 3', 3);

-- --------------------------------------------------------

--
-- Table structure for table `guardians`
--

CREATE TABLE `guardians` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `whatsapp_phone` varchar(20) DEFAULT NULL,
  `alt_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guardians`
--

INSERT INTO `guardians` (`id`, `name`, `phone`, `whatsapp_phone`, `alt_phone`) VALUES
(1, 'ولي أمر الطالب', '01000000004', NULL, '01000000005'),
(2, 'ولي أمر الطالب', '01000000004', NULL, '01000000005'),
(3, 'ولي أمر تجريبي', '01111111111', NULL, NULL),
(4, 'علي سليمان', '1122334455667', '7665544332211', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chapter_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sort_order` smallint(6) DEFAULT 0,
  `status` enum('draft','published','hidden') DEFAULT 'draft',
  `available_from` timestamp NULL DEFAULT NULL,
  `available_until` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `chapter_id`, `title`, `description`, `thumbnail_url`, `price`, `sort_order`, `status`, `available_from`, `available_until`, `deleted_at`, `video_url`) VALUES
(1, 1, 'الحصة الأولى: المتغيرات والمعادلات', 'شرح مبسط للمتغيرات والمعادلات مع أمثلة محلولة.', NULL, 75.00, 1, 'published', '2026-07-28 20:42:16', '2026-08-27 20:42:16', NULL, '/uploads/videos/lesson-1-1785637139625.mp4'),
(2, 2, ' اساسيات النحو', ' اساسيات النحو و النعت والصرف والبدء ', NULL, 500.00, 1, 'published', '2026-07-29 21:00:00', '2026-07-31 15:06:00', NULL, NULL),
(3, 1, 'الحصة الأولى: المتغيرات والمعادلات', 'شرح مبسط للمتغيرات والمعادلات مع أمثلة محلولة.', NULL, 75.00, 1, 'published', '2026-08-01 18:27:05', '2026-08-31 18:27:05', NULL, NULL),
(4, 4, 'الحصة الأولى التجريبية', 'حصة مخصصة لاختبار الفيديوهات والامتحانات والواجبات.', NULL, 100.00, 1, 'published', '2026-08-11 19:25:39', '2026-09-10 19:25:39', NULL, '/uploads/videos/lesson-4-1786480188864.mp4'),
(5, 4, 'تاني حصة', 'بتنجان ثقلثق لثقلثقلث', NULL, 98.00, 2, 'published', '2026-08-11 20:44:13', NULL, NULL, '/uploads/videos/lesson-5-1786481135329.mp4'),
(6, 5, 'الحصة الاولي', '- مقدمة المنهج الدراسي\n- مراجعة الاساسيات', NULL, 50.00, 1, 'published', '2026-08-13 22:55:24', NULL, NULL, '/uploads/videos/lesson-6-1786661766178.mp4'),
(7, 7, 'القصة الانجليزية الجديدة', 'القصة الانجليزية الجديدةالقصة الانجليزية الجديدةالقصة الانجليزية الجديدةالقصة الانجليزية الجديدةالقصة الانجليزية الجديدة', NULL, 75.00, 1, 'published', '2026-08-14 14:48:09', NULL, NULL, '/uploads/videos/lesson-7-1786718931895.mp4');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_assignments`
--

CREATE TABLE `lesson_assignments` (
  `id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `title` varchar(190) NOT NULL,
  `description` text DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_assignments`
--

INSERT INTO `lesson_assignments` (`id`, `lesson_id`, `title`, `description`, `attachment_url`, `due_at`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'حل مسائل الجبر', 'حل 50 مسئلة جبر فراغية و تقيمية', '/uploads/assignments/assignment-1-1785639688263.pdf', '2026-08-02 06:05:00', 1, '2026-08-02 03:01:28', '2026-08-02 03:01:28'),
(2, 4, 'حل البتاعة', 'ثقلس                    قلقل\r\nلأق\r\nلثلث\r\nقلقث\r\nقل\r\nقث\r\nثق\r\nقث', '/uploads/assignments/assignment-4-1786480272620.pdf', '2020-12-22 15:32:00', 1, '2026-08-11 20:31:12', '2026-08-11 20:31:12'),
(3, 5, 'حل الشيت دي كلها', 'تحل كويس منغير ما تلعب32', '/uploads/assignments/assignment-5-1786481126299.pdf', '2024-03-03 15:33:00', 1, '2026-08-11 20:45:26', '2026-08-11 20:45:26'),
(4, 6, 'حل القطع الخمس', 'مطلوب حل اربع قطع دون استخدام ai', '/uploads/assignments/assignment-6-1786661894028.jpg', '2026-08-29 13:22:00', 1, '2026-08-13 22:58:14', '2026-08-13 22:58:14');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_assignment_submissions`
--

CREATE TABLE `lesson_assignment_submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `submission_url` varchar(500) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('submitted','reviewed','accepted','rejected') NOT NULL DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` datetime DEFAULT NULL,
  `teacher_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_assignment_submissions`
--

INSERT INTO `lesson_assignment_submissions` (`id`, `assignment_id`, `student_id`, `submission_url`, `notes`, `status`, `submitted_at`, `reviewed_at`, `teacher_notes`) VALUES
(1, 3, 3, '/uploads/assignment-submissions/submission-3-3-ubOCdGK6.pdf', 'عملت الواجب', 'submitted', '2026-08-11 21:22:46', NULL, NULL),
(2, 2, 3, '/uploads/assignment-submissions/submission-2-3-POuq84-a.jpg', 'ص', 'submitted', '2026-08-13 20:37:31', NULL, NULL),
(3, 4, 4, '/uploads/assignment-submissions/submission-4-4-zPgHpA82.jpg', 'jl hgpg', 'submitted', '2026-08-13 23:19:01', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lesson_exams`
--

CREATE TABLE `lesson_exams` (
  `id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `title` varchar(190) NOT NULL,
  `description` text DEFAULT NULL,
  `pass_score` int(11) NOT NULL DEFAULT 60,
  `is_required_to_unlock_next` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `placement` enum('before_content','after_content') NOT NULL DEFAULT 'after_content'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_exams`
--

INSERT INTO `lesson_exams` (`id`, `lesson_id`, `title`, `description`, `pass_score`, `is_required_to_unlock_next`, `sort_order`, `created_at`, `updated_at`, `placement`) VALUES
(1, 1, 'اختبار عن اساسيات المادة', 'ركز', 60, 1, 1, '2026-08-02 03:19:38', '2026-08-02 03:19:38', 'after_content'),
(2, 4, 'امتحان قبل الحصة', 'امتحان قصير يظهر للطالب قبل مشاهدة محتوى الحصة.', 60, 0, 0, '2026-08-11 19:25:39', '2026-08-11 19:25:39', 'after_content'),
(3, 4, 'حل قبل الحصة يا يبني', 'صثبثبصثصث صثصثقبصثقب\nُ[ُ[ثبثبثصُب\nثبص', 20, 1, 1, '2026-08-11 20:31:46', '2026-08-11 20:31:46', 'before_content'),
(4, 4, 'حل بعد الحصة يبني', 'صبث ثصب صثةوكةثقوزق ثثققث', 30, 0, 1, '2026-08-11 20:32:08', '2026-08-11 20:32:08', 'after_content'),
(5, 4, 'تالت', 'يبلل', 60, 0, 2, '2026-08-11 20:43:30', '2026-08-11 20:43:30', 'before_content'),
(6, 5, 'قبلي', 'قثلثقلثقل', 10, 0, 1, '2026-08-11 21:05:13', '2026-08-11 21:05:13', 'before_content'),
(7, 6, 'امتحان تمهيدي للاساسيات', 'مراجعة علي اساسيات ادوات السؤال', 80, 1, 1, '2026-08-13 22:58:46', '2026-08-13 22:58:46', 'after_content'),
(8, 6, 'exam 2', 'english exam2', 50, 1, 2, '2026-08-19 00:22:53', '2026-08-19 00:22:53', 'after_content');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_exam_answers`
--

CREATE TABLE `lesson_exam_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `choice_id` int(11) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `points_awarded` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_exam_answers`
--

INSERT INTO `lesson_exam_answers` (`id`, `attempt_id`, `question_id`, `choice_id`, `is_correct`, `points_awarded`, `created_at`) VALUES
(5, 3, 1, 3, 0, 0, '2026-08-02 03:48:18'),
(6, 3, 2, 7, 1, 55, '2026-08-02 03:48:18'),
(7, 4, 3, 9, 1, 1, '2026-08-11 20:01:19'),
(8, 5, 4, 12, 1, 5, '2026-08-11 21:07:33'),
(9, 5, 5, 17, 0, 0, '2026-08-11 21:07:33'),
(10, 6, 6, 18, 1, 10, '2026-08-13 23:19:19'),
(11, 6, 7, 23, 1, 10, '2026-08-13 23:19:19');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_exam_attempts`
--

CREATE TABLE `lesson_exam_attempts` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `passed` tinyint(1) NOT NULL DEFAULT 0,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_exam_attempts`
--

INSERT INTO `lesson_exam_attempts` (`id`, `exam_id`, `student_id`, `score`, `passed`, `submitted_at`) VALUES
(3, 1, 1, 92, 1, '2026-08-02 03:48:18'),
(4, 2, 3, 100, 1, '2026-08-11 20:01:19'),
(5, 6, 3, 50, 1, '2026-08-11 21:07:33'),
(6, 7, 4, 100, 1, '2026-08-13 23:19:19');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_exam_choices`
--

CREATE TABLE `lesson_exam_choices` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `choice_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_exam_choices`
--

INSERT INTO `lesson_exam_choices` (`id`, `question_id`, `choice_text`, `is_correct`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, '2', 1, 1, '2026-08-02 03:29:06', '2026-08-02 03:29:06'),
(2, 1, '3', 0, 2, '2026-08-02 03:29:06', '2026-08-02 03:29:06'),
(3, 1, '4', 0, 3, '2026-08-02 03:29:06', '2026-08-02 03:29:06'),
(4, 1, '5', 0, 4, '2026-08-02 03:29:06', '2026-08-02 03:29:06'),
(5, 2, '3', 0, 1, '2026-08-02 03:29:42', '2026-08-02 03:29:42'),
(6, 2, '32', 0, 2, '2026-08-02 03:29:42', '2026-08-02 03:29:42'),
(7, 2, '4', 1, 3, '2026-08-02 03:29:42', '2026-08-02 03:29:42'),
(8, 2, '432', 0, 4, '2026-08-02 03:29:42', '2026-08-02 03:29:42'),
(9, 3, 'اختبار المنصة وتجربة رحلة الطالب', 1, 1, '2026-08-11 19:25:39', '2026-08-11 19:25:39'),
(10, 3, 'حذف بيانات الطلاب', 0, 2, '2026-08-11 19:25:39', '2026-08-11 19:25:39'),
(11, 4, '2', 0, 1, '2026-08-11 21:05:53', '2026-08-11 21:05:53'),
(12, 4, '3', 1, 2, '2026-08-11 21:05:53', '2026-08-11 21:05:53'),
(13, 4, '4', 0, 3, '2026-08-11 21:05:53', '2026-08-11 21:05:53'),
(14, 4, '5', 0, 4, '2026-08-11 21:05:53', '2026-08-11 21:05:53'),
(15, 5, '8', 1, 1, '2026-08-11 21:06:20', '2026-08-11 21:06:20'),
(16, 5, '32', 0, 2, '2026-08-11 21:06:20', '2026-08-11 21:06:20'),
(17, 5, '23', 0, 3, '2026-08-11 21:06:20', '2026-08-11 21:06:20'),
(18, 6, 'what', 1, 1, '2026-08-13 22:59:42', '2026-08-13 22:59:42'),
(19, 6, 'where', 0, 2, '2026-08-13 22:59:42', '2026-08-13 22:59:42'),
(20, 6, 'why', 0, 3, '2026-08-13 22:59:42', '2026-08-13 22:59:42'),
(21, 6, 'no answer', 0, 4, '2026-08-13 22:59:42', '2026-08-13 22:59:42'),
(22, 7, 'what', 0, 1, '2026-08-13 23:00:23', '2026-08-13 23:00:23'),
(23, 7, 'where', 1, 2, '2026-08-13 23:00:23', '2026-08-13 23:00:23'),
(24, 7, 'why', 0, 3, '2026-08-13 23:00:23', '2026-08-13 23:00:23'),
(25, 7, 'no answer', 0, 4, '2026-08-13 23:00:23', '2026-08-13 23:00:23'),
(26, 8, '2', 1, 1, '2026-08-19 00:23:35', '2026-08-19 00:23:35'),
(27, 8, '4', 0, 2, '2026-08-19 00:23:35', '2026-08-19 00:23:35'),
(28, 8, '2', 0, 3, '2026-08-19 00:23:35', '2026-08-19 00:23:35'),
(29, 8, '5', 0, 4, '2026-08-19 00:23:35', '2026-08-19 00:23:35');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_exam_questions`
--

CREATE TABLE `lesson_exam_questions` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `points` int(11) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_exam_questions`
--

INSERT INTO `lesson_exam_questions` (`id`, `exam_id`, `question_text`, `points`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, '1+1 =؟', 5, 1, '2026-08-02 03:29:06', '2026-08-02 03:29:06'),
(2, 1, '2*2=', 55, 2, '2026-08-02 03:29:42', '2026-08-02 03:29:42'),
(3, 2, 'ما الهدف من هذه الحصة؟', 1, 1, '2026-08-11 19:25:39', '2026-08-11 19:25:39'),
(4, 6, '1+2', 5, 1, '2026-08-11 21:05:53', '2026-08-11 21:05:53'),
(5, 6, '4+4', 5, 2, '2026-08-11 21:06:20', '2026-08-11 21:06:20'),
(6, 7, 'اداة تعريف \"ماذا\"', 10, 1, '2026-08-13 22:59:42', '2026-08-13 22:59:42'),
(7, 7, 'اداة تعريف \"اين               \"', 10, 2, '2026-08-13 23:00:23', '2026-08-13 23:00:23'),
(8, 7, '1+1', 10, 3, '2026-08-19 00:23:35', '2026-08-19 00:23:35');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_videos`
--

CREATE TABLE `lesson_videos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_url` varchar(1000) DEFAULT NULL,
  `storage_path` varchar(1000) DEFAULT NULL,
  `duration_seconds` int(10) UNSIGNED DEFAULT 0,
  `sort_order` smallint(6) DEFAULT 0,
  `available_from` timestamp NULL DEFAULT NULL,
  `available_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_videos`
--

INSERT INTO `lesson_videos` (`id`, `lesson_id`, `title`, `video_url`, `storage_path`, `duration_seconds`, `sort_order`, `available_from`, `available_until`) VALUES
(1, 2, ' ملخص أساسيات النحو', 'https://youtu.be/cQ9nPp1FlW4?si=TPwmcxz9SozbrsE8', 'lesson1', 3517, 1, '2026-07-28 21:30:00', '2026-07-31 21:30:00'),
(2, 2, 'مقدمة الاساسيات النحوية', '/uploads/videos/1785428567253-_.mp4', '/uploads/videos/1785428567253-_.mp4', 600, 2, '2026-07-30 09:23:00', '2026-08-01 21:21:00'),
(3, 2, ' fgbf', '/uploads/videos/1785430980386-_.mp4', '/uploads/videos/1785430980386-_.mp4', 321, 3, '2026-12-21 12:32:00', '2026-12-23 13:13:00'),
(4, 2, 'fgd', '/uploads/videos/1785432948029-_.mp4', '/uploads/videos/1785432948029-_.mp4', 21, 12, '2026-12-01 00:12:00', '2026-02-02 22:12:00'),
(5, 1, 'فيديو الدرس 2', '/uploads/videos/lesson-1-1785638684551.mp4', NULL, 0, 1, NULL, NULL),
(6, 1, 'فيديو الدرس 2', '/uploads/videos/lesson-1-1785639022694.mp4', NULL, 0, 2, NULL, NULL),
(7, 4, 'الدرس الثالث', '/uploads/videos/lesson-4-1786480188864.mp4', NULL, 0, 1, NULL, NULL),
(8, 4, 'الدرس الثالث part 2', '/uploads/videos/lesson-4-1786480237088.mp4', NULL, 0, 2, NULL, NULL),
(9, 5, 'فيديو الدرس 2', '/uploads/videos/lesson-5-1786481135329.mp4', NULL, 0, 1, NULL, NULL),
(10, 6, 'فيديو شرح الدرس الاول', '/uploads/videos/lesson-6-1786661766178.mp4', NULL, 0, 1, NULL, NULL),
(11, 7, 'فيديو القصة', '/uploads/videos/lesson-7-1786718931895.mp4', NULL, 0, 1, NULL, NULL),
(12, 6, ' Lesson Video 2', '/uploads/videos/lesson-6-1787098941688.mp4', NULL, 0, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `login_sessions`
--

CREATE TABLE `login_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_token` varchar(500) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`device_info`)),
  `user_agent` text DEFAULT NULL,
  `last_active_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `lesson_price_at_payment` decimal(10,2) NOT NULL,
  `platform_amount` decimal(10,2) NOT NULL,
  `teacher_amount` decimal(10,2) NOT NULL,
  `commission_pct` decimal(5,2) NOT NULL,
  `payment_method_id` tinyint(3) UNSIGNED NOT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `status` enum('completed','cancelled','refunded') DEFAULT 'completed',
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `invoice_number`, `student_id`, `lesson_id`, `amount_paid`, `lesson_price_at_payment`, `platform_amount`, `teacher_amount`, `commission_pct`, `payment_method_id`, `transaction_ref`, `status`, `paid_at`, `notes`, `created_by`, `cancelled_at`, `cancel_reason`, `created_at`) VALUES
(1, 'INV-2026-EF2BJQY-', 1, 1, 75.00, 75.00, 15.00, 60.00, 20.00, 1, NULL, 'completed', '2026-08-01 20:55:39', NULL, 1, NULL, NULL, '2026-08-01 20:55:39'),
(2, 'INV-2026-NVTWHXJO', 1, 1, 3.00, 75.00, 0.60, 2.40, 20.00, 1, NULL, 'completed', '2026-08-11 14:50:42', 'trtrt', 1, NULL, NULL, '2026-08-11 14:50:42'),
(3, 'INV-2026-XGUF4J8P', 4, 6, 100.00, 50.00, 25.00, 75.00, 25.00, 1, NULL, 'completed', '2026-08-16 16:01:10', NULL, 9, NULL, NULL, '2026-08-16 16:01:10'),
(4, 'INV-2026-FDY86IUI', 4, 7, 198.00, 75.00, 49.50, 148.50, 25.00, 1, NULL, 'completed', '2026-08-29 17:14:39', NULL, 13, NULL, NULL, '2026-08-29 17:14:39');

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `slug`, `is_active`) VALUES
(1, 'Cash', 'cash', 1),
(2, 'E-Wallet', 'wallet', 1),
(3, 'Bank Transfer', 'bank_transfer', 1),
(4, 'Payment Card', 'card', 1),
(5, 'Other', 'other', 1);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `question_choices`
--

CREATE TABLE `question_choices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `choice_text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `sort_order` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` enum('admin','teacher','student') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`) VALUES
(1, 'admin', '2026-07-28 20:42:16'),
(2, 'teacher', '2026-07-28 20:42:16'),
(3, 'student', '2026-07-28 20:42:16');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` tinyint(3) UNSIGNED NOT NULL,
  `permission_id` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `education_type_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `student_code` varchar(30) NOT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `governorate` varchar(100) DEFAULT NULL,
  `whatsapp_phone` varchar(20) DEFAULT NULL,
  `school_id` int(10) UNSIGNED DEFAULT NULL,
  `stage_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `grade_id` smallint(5) UNSIGNED DEFAULT NULL,
  `education_type_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `guardian_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_code`, `national_id`, `date_of_birth`, `gender`, `address`, `governorate`, `whatsapp_phone`, `school_id`, `stage_id`, `grade_id`, `education_type_id`, `guardian_id`, `created_at`) VALUES
(1, 3, 'STU-0001', '30001010101010', NULL, NULL, 'القاهرة', 'القاهرة', NULL, NULL, 1, 1, 1, 1, '2026-07-28 20:42:16'),
(3, 11, 'STU-TEST-001', NULL, NULL, NULL, 'القاهرة', 'القاهرة', NULL, NULL, 1, 1, 1, 1, '2026-08-11 19:25:39'),
(4, 12, 'STU-1786656445539-524841', NULL, NULL, NULL, 'اسكندرية ', 'اسكندرية', '10987654321', NULL, 18, 71, 3, 4, '2026-08-13 21:27:25');

-- --------------------------------------------------------

--
-- Table structure for table `student_answers`
--

CREATE TABLE `student_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attempt_id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `selected_choice_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `marks_earned` decimal(6,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_course_requests`
--

CREATE TABLE `student_course_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `teacher_notes` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_teacher_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_course_requests`
--

INSERT INTO `student_course_requests` (`id`, `student_id`, `course_id`, `status`, `teacher_notes`, `requested_at`, `reviewed_at`, `reviewed_by_teacher_id`) VALUES
(1, 4, 5, 'accepted', NULL, '2026-08-13 22:45:16', '2026-08-14 01:53:01', 6);

-- --------------------------------------------------------

--
-- Table structure for table `student_lesson_access`
--

CREATE TABLE `student_lesson_access` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `access_code_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `access_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_lesson_access`
--

INSERT INTO `student_lesson_access` (`id`, `student_id`, `lesson_id`, `access_code_id`, `payment_id`, `granted_at`, `access_until`, `created_at`) VALUES
(1, 1, 1, NULL, 1, '2026-08-01 20:55:39', NULL, '2026-08-01 21:33:52'),
(4, 3, 4, NULL, NULL, '2026-08-11 19:25:39', '2026-09-10 19:25:39', '2026-08-11 19:25:39'),
(5, 3, 3, 6, NULL, '2026-08-11 20:23:38', NULL, '2026-08-11 20:23:38'),
(6, 3, 5, 14, NULL, '2026-08-11 20:56:30', NULL, '2026-08-11 20:56:30'),
(7, 4, 6, 24, NULL, '2026-08-13 23:17:59', NULL, '2026-08-13 23:17:59'),
(8, 4, 7, 25, NULL, '2026-08-14 14:49:48', NULL, '2026-08-14 14:49:48');

-- --------------------------------------------------------

--
-- Table structure for table `submission_files`
--

CREATE TABLE `submission_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `submission_id` bigint(20) UNSIGNED NOT NULL,
  `file_url` varchar(1000) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size_kb` int(10) UNSIGNED DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `bio` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `platform_commission_pct` decimal(5,2) DEFAULT 20.00,
  `bank_account_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bank_account_info`)),
  `wallet_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wallet_info`)),
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `total_settled` decimal(12,2) DEFAULT 0.00,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `bio`, `address`, `platform_commission_pct`, `bank_account_info`, `wallet_info`, `total_earnings`, `total_settled`, `created_by`) VALUES
(1, 2, 'مدرس رياضيات بخبرة 10 سنوات', 'القاهرة', 20.00, NULL, NULL, 62.40, 0.00, NULL),
(2, 4, 'مدرس لغة عربية بخبرة 8 سنوات', 'الجيزة', 25.00, NULL, NULL, 0.00, 0.00, NULL),
(4, 8, 'teacher Mathmatics ', 'Alex-Sidi Gaber', 7.00, NULL, NULL, 0.00, 0.00, NULL),
(5, 10, 'مدرس تجريبي لاختبار المنصة', 'القاهرة', 20.00, NULL, NULL, 0.00, 0.00, NULL),
(6, 13, 'مدرس مادة انجليزية للمرحلة الثانوية', 'الجيزة', 25.00, NULL, NULL, 223.50, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_settlements`
--

CREATE TABLE `teacher_settlements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `period_from` date DEFAULT NULL,
  `period_to` date DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL DEFAULT uuid(),
  `role_id` tinyint(3) UNSIGNED NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `suspension_ends_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `max_devices` tinyint(4) DEFAULT 3,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `role_id`, `email`, `phone`, `password_hash`, `full_name`, `avatar_url`, `status`, `suspension_ends_at`, `email_verified_at`, `phone_verified_at`, `two_factor_enabled`, `two_factor_secret`, `max_devices`, `created_at`, `updated_at`, `deleted_at`, `last_login_at`) VALUES
(1, 'd22feba7-8ac4-11f1-95d3-902e162c75db', 1, 'admin@horizon.test', '01000000001', '$2a$10$bcvqHrqUqvQH98xwVK0AbunDEXMV2caI4KT5I4oUKgsRXpvwHoVBC', 'مدير النظام', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-07-28 20:42:16', '2026-08-29 16:20:47', NULL, '2026-08-29 19:20:47'),
(2, 'd2306aa3-8ac4-11f1-95d3-902e162c75db', 2, 'teacher@horizon.test', '01000000002', '$2a$10$4x8RGTGdQGm9O3Kf8qAwy.Ptjkn3bJjgZhrgS.AqqrwIf8nuZ4ffW', 'د. أحمد درويش', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-07-28 20:42:16', '2026-08-11 20:20:17', NULL, '2026-08-11 23:20:17'),
(3, 'd23142e6-8ac4-11f1-95d3-902e162c75db', 3, 'student@horizon.test', '01000000003', '$2a$10$bZcMdNyYHwheV4zkcOmJOOuxFZJi4NKh320eS6xQgbghEPjMIt4Ru', 'محمد محمود', NULL, 'suspended', NULL, NULL, NULL, 0, NULL, 3, '2026-07-28 20:42:16', '2026-08-14 14:51:41', '2026-08-14 14:51:41', NULL),
(4, 'b3b21ab2-8ad7-11f1-95d3-902e162c75db', 2, 'mahmoud.teacher@test.com', '01015175618', '$2a$10$MWb.E3.2uogFcDYPbHcf0efAazpSjgW1hrubfdX6Agtz7wTnvWWpi', 'أ. محمود علي', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-07-28 22:57:28', '2026-07-28 22:57:28', NULL, NULL),
(8, 'f608cbd4-8de7-11f1-875a-902e162c75db', 2, 'sherif@gmail.com', '01015175674', '$2a$10$fOtR2KkQNLt4MLBCH3L55uqxcbRfknziTlmFnYFvOGqSOzr8wZ72G', 'د. شريف صاير نديب', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-01 20:31:22', '2026-08-01 20:31:22', NULL, NULL),
(9, '6f6868b7-95ba-11f1-8441-902e162c75db', 1, 'admin@horizon.local', '01000000000', '$2a$10$jtff3O9b7IbUq/5GNKqaK.9hUt/8vxvi6UEvZHjLcazmt4FJgdH8.', 'مسؤول النظام', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-11 19:25:39', '2026-08-29 17:28:16', NULL, '2026-08-29 20:28:16'),
(10, '6f68c78f-95ba-11f1-8441-902e162c75db', 2, 'teacher@horizon.local', '01000000001', '$2a$10$EOxPJVaYggtiwNpjfzAHbebz/bYvYV42Pqr2LR.xd5hxoq8ZjZcwy', 'أ. أحمد محمد', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-11 19:25:39', '2026-08-13 20:37:56', NULL, '2026-08-13 23:37:56'),
(11, '6f698cde-95ba-11f1-8441-902e162c75db', 3, 'student@horizon.local', '01000000002', '$2a$10$A8.qnfmYlYcnjizeKxLj7uwOCdtju3s6yGi.M6.SMB48eGl65N5AW', 'محمد علي', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-11 19:25:39', '2026-08-13 20:36:08', NULL, '2026-08-13 23:36:08'),
(12, 'c738bab2-975d-11f1-b1d9-902e162c75db', 3, 'student1@horizon.local', '12345678910', '$2a$10$36BsLhJQCD5Ylc2DQVsXYOtzAavSyHIoQ.P70pYwVIYJssyDMjQD6', 'يوسف علي سليمان', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-13 21:27:25', '2026-08-19 00:23:51', NULL, '2026-08-19 03:23:51'),
(13, '3584f402-975e-11f1-b1d9-902e162c75db', 2, 'saadhamada1@gmail.com', '1122334455667', '$2a$10$/DLesLhbzootMIG7McpDwefSaR8UBVieML7CsN2kornBojegbFXti', 'مستر سعد حمادة', NULL, 'active', NULL, NULL, NULL, 0, NULL, 3, '2026-08-13 21:30:30', '2026-08-29 17:15:46', NULL, '2026-08-29 20:15:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_codes`
--
ALTER TABLE `access_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code_hash` (`code_hash`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `assigned_student_id` (`assigned_student_id`),
  ADD KEY `used_by_student_id` (`used_by_student_id`),
  ADD KEY `created_by_teacher_id` (`created_by_teacher_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_batch` (`batch_id`);

--
-- Indexes for table `account_blocks`
--
ALTER TABLE `account_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `chapter_id` (`chapter_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_sort` (`course_id`,`sort_order`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `education_type_id` (`education_type_id`),
  ADD KEY `idx_teacher` (`teacher_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `course_education_types`
--
ALTER TABLE `course_education_types`
  ADD PRIMARY KEY (`course_id`,`education_type_id`),
  ADD KEY `idx_cet_course` (`course_id`),
  ADD KEY `idx_cet_type` (`education_type_id`);

--
-- Indexes for table `course_stages`
--
ALTER TABLE `course_stages`
  ADD PRIMARY KEY (`course_id`,`stage_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `educational_stages`
--
ALTER TABLE `educational_stages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `education_types`
--
ALTER TABLE `education_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `chapter_id` (`chapter_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_exam_student` (`exam_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `guardians`
--
ALTER TABLE `guardians`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chapter_sort` (`chapter_id`,`sort_order`);

--
-- Indexes for table `lesson_assignments`
--
ALTER TABLE `lesson_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lesson_assignments_lesson` (`lesson_id`);

--
-- Indexes for table `lesson_assignment_submissions`
--
ALTER TABLE `lesson_assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment_student` (`assignment_id`,`student_id`),
  ADD KEY `idx_assignment_submissions_assignment` (`assignment_id`),
  ADD KEY `idx_assignment_submissions_student` (`student_id`);

--
-- Indexes for table `lesson_exams`
--
ALTER TABLE `lesson_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lesson_exams_lesson` (`lesson_id`),
  ADD KEY `idx_lesson_exams_required` (`is_required_to_unlock_next`);

--
-- Indexes for table `lesson_exam_answers`
--
ALTER TABLE `lesson_exam_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_answers_attempt` (`attempt_id`),
  ADD KEY `idx_exam_answers_question` (`question_id`);

--
-- Indexes for table `lesson_exam_attempts`
--
ALTER TABLE `lesson_exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_attempts_exam_student` (`exam_id`,`student_id`),
  ADD KEY `idx_exam_attempts_student` (`student_id`);

--
-- Indexes for table `lesson_exam_choices`
--
ALTER TABLE `lesson_exam_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_choices_question` (`question_id`);

--
-- Indexes for table `lesson_exam_questions`
--
ALTER TABLE `lesson_exam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_questions_exam` (`exam_id`);

--
-- Indexes for table `lesson_videos`
--
ALTER TABLE `lesson_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_user_active` (`user_id`,`is_active`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`read_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_invoice` (`invoice_number`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_paid_at` (`paid_at`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `education_type_id` (`education_type_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_code` (`student_code`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `stage_id` (`stage_id`),
  ADD KEY `grade_id` (`grade_id`),
  ADD KEY `education_type_id` (`education_type_id`),
  ADD KEY `guardian_id` (`guardian_id`),
  ADD KEY `idx_student_code` (`student_code`),
  ADD KEY `idx_national_id` (`national_id`);

--
-- Indexes for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attempt_id` (`attempt_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `selected_choice_id` (`selected_choice_id`);

--
-- Indexes for table `student_course_requests`
--
ALTER TABLE `student_course_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_course_request` (`student_id`,`course_id`),
  ADD KEY `idx_student_course_requests_student` (`student_id`),
  ADD KEY `idx_student_course_requests_course` (`course_id`),
  ADD KEY `idx_student_course_requests_status` (`status`);

--
-- Indexes for table `student_lesson_access`
--
ALTER TABLE `student_lesson_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_lesson` (`student_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `teacher_settlements`
--
ALTER TABLE `teacher_settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_codes`
--
ALTER TABLE `access_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `account_blocks`
--
ALTER TABLE `account_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `chapters`
--
ALTER TABLE `chapters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `educational_stages`
--
ALTER TABLE `educational_stages`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `education_types`
--
ALTER TABLE `education_types`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_questions`
--
ALTER TABLE `exam_questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `guardians`
--
ALTER TABLE `guardians`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `lesson_assignments`
--
ALTER TABLE `lesson_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lesson_assignment_submissions`
--
ALTER TABLE `lesson_assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lesson_exams`
--
ALTER TABLE `lesson_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `lesson_exam_answers`
--
ALTER TABLE `lesson_exam_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `lesson_exam_attempts`
--
ALTER TABLE `lesson_exam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `lesson_exam_choices`
--
ALTER TABLE `lesson_exam_choices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `lesson_exam_questions`
--
ALTER TABLE `lesson_exam_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `lesson_videos`
--
ALTER TABLE `lesson_videos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `question_choices`
--
ALTER TABLE `question_choices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_answers`
--
ALTER TABLE `student_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_course_requests`
--
ALTER TABLE `student_course_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_lesson_access`
--
ALTER TABLE `student_lesson_access`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `submission_files`
--
ALTER TABLE `submission_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `teacher_settlements`
--
ALTER TABLE `teacher_settlements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_codes`
--
ALTER TABLE `access_codes`
  ADD CONSTRAINT `access_codes_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `access_codes_ibfk_2` FOREIGN KEY (`assigned_student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `access_codes_ibfk_3` FOREIGN KEY (`used_by_student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `access_codes_ibfk_4` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `account_blocks`
--
ALTER TABLE `account_blocks`
  ADD CONSTRAINT `account_blocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`),
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`);

--
-- Constraints for table `chapters`
--
ALTER TABLE `chapters`
  ADD CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`education_type_id`) REFERENCES `education_types` (`id`);

--
-- Constraints for table `course_education_types`
--
ALTER TABLE `course_education_types`
  ADD CONSTRAINT `fk_cet_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cet_type` FOREIGN KEY (`education_type_id`) REFERENCES `education_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_stages`
--
ALTER TABLE `course_stages`
  ADD CONSTRAINT `course_stages_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_stages_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `educational_stages` (`id`);

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`),
  ADD CONSTRAINT `exams_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  ADD CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Constraints for table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`stage_id`) REFERENCES `educational_stages` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_videos`
--
ALTER TABLE `lesson_videos`
  ADD CONSTRAINT `lesson_videos_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD CONSTRAINT `login_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  ADD CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD CONSTRAINT `question_choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`);

--
-- Constraints for table `schools`
--
ALTER TABLE `schools`
  ADD CONSTRAINT `schools_ibfk_1` FOREIGN KEY (`education_type_id`) REFERENCES `education_types` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`stage_id`) REFERENCES `educational_stages` (`id`),
  ADD CONSTRAINT `students_ibfk_4` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `students_ibfk_5` FOREIGN KEY (`education_type_id`) REFERENCES `education_types` (`id`),
  ADD CONSTRAINT `students_ibfk_6` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`);

--
-- Constraints for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`),
  ADD CONSTRAINT `student_answers_ibfk_3` FOREIGN KEY (`selected_choice_id`) REFERENCES `question_choices` (`id`);

--
-- Constraints for table `student_lesson_access`
--
ALTER TABLE `student_lesson_access`
  ADD CONSTRAINT `student_lesson_access_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `student_lesson_access_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`);

--
-- Constraints for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD CONSTRAINT `submission_files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `teacher_settlements`
--
ALTER TABLE `teacher_settlements`
  ADD CONSTRAINT `teacher_settlements_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
