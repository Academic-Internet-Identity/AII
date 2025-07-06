# Academic Internet Identity

## Video Explain:

[![Video en Google Drive](https://img.shields.io/badge/Ver%20video%20en-Google%20Drive-blue)](https://drive.google.com/file/d/1mDyerCRnwNef42G6no_yHTnjErZAGBCR/view?usp=drivesdk)
[![Ver video en Google Drive](https://img.icons8.com/ios/452/play--v1.png)](https://drive.google.com/file/d/1mDyerCRnwNef42G6no_yHTnjErZAGBCR/view?usp=drivesdk)

## Live Application

[![Visit Live Application](https://img.shields.io/badge/Visit%20Live%20Application-ICP-blue)](https://cj2kt-2yaaa-aaaag-qkfoa-cai.icp0.io/)

## Description

The AII (School Management Platform) is a system developed for efficient management of users, subjects, and schedules at the Universidad Tecnológica Metropolitana de Aguascalientes (UTMA), with the possibility of expanding the scope. The system allows the management of profiles for students, administrative staff, and teachers, as well as integrating functionalities for querying information through HTTP calls to external APIs.

## Features

- Registration and management of users with different roles: students, administrative staff, and teachers.
- Management of subjects and schedules.
- Creation and management of groups and assignment of subjects.
- Integration with external APIs for data querying.
- Payment handling: Users can make secure payments through the platform.
- File management: Users with role Student, Teacher or Administrative can upload, share, and delete files.
- Request and process generation: Supports the creation and tracking of academic or administrative requests.
- Administration panel for approval of registrations.
- User interface developed in React.
- Backend developed in Motoko

## Technologies Used

- **Frontend:** React.js with CSS for styling.
- **Backend:** Motoko on the Internet Computer platform.
- **Authentication:** Internet Identity for user identity management.

## Environment Setup

### Prerequisites

- Node.js and npm installed, node 20

```
node --version
```

- DFX (Dfinity SDK) configured and running, dfx 0.20.1

```
dfx --version
```

- Internet Identity configured for local development
- Global install mops and ic-mops

```
npm install -g ic-mops@1.9.0 mops@3.0.2
npm ls -g
```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Academic-Internet-Identity/AII.git
   cd AII
   ```

2. **Install frontend dependencies:**

   ```bash
   cd src/AII_frontend
   npm install
   ```

3. **Verify Mops:**

   Add the necessary dependencies using Mops:

   ```bash
   mops install
   ```

4. **Deploy the project:**

   ```bash
   cd src/AII_backend
   dfx start --background --clean
   ```

- To deploy your Internet Computer application locally, you need to use the `deps`.

  ```bash
  dfx deps pull
  dfx deps deploy
  ```

  ```bash
  dfx deploy
  ```

- When the process ask you for a number for a Nat, you must type **10_000_000**, this is for a first buket canister

- For local deployment, check and adapt the providers in App.jsx and the agent in UploadFile.jsx

## Adding an Admin via Terminal

To add a user as an admin in your Internet Computer application using the terminal, use the following `dfx` command. Replace `<USER_PRINCIPAL>` with the actual principal ID of the user you want to add as an admin.

```bash
dfx canister call AII_backend agregarAdmin '(principal "<USER_PRINCIPAL>")'
```

- Only the deployer can designate a user as an admin using the terminal.
- An admin user can approve and manage all the services of the platform.

## Detailed Information on Features

### User Registration and Management

- **Students:** Registration of students with detailed information such as name, surname, date of birth, CURP, gender, place of birth, marital status, email, addresses, phone numbers, medical details, social security number, etc.
- **Administrative Staff:** Registration of administrative staff with relevant information such as name, surname, date of birth, CURP, gender, place of birth, marital status, email, addresses, phone numbers, medical details, social security number, professional ID, etc.
- **Teachers:** Registration of teachers with information similar to that of administrative staff, plus a list of subjects they teach.

### Subject and Schedule Management

- **Groups:** Creation and management of student groups.
- **Subjects:** Assignment of subjects to groups and teachers.
- **Schedules:** Management of schedules for each group, including the assignment of subjects and teachers to specific timeslots.

### Integration with External APIs

- Capability to perform queries to external APIs to obtain additional information or verify data.

### Administration Panel

- **Approval of Registrations:** Administrators can approve or reject registration requests for students, administrative staff, and teachers.
- **Information Query:** Viewing records of students, administrative staff, teachers, groups, and schedules.

### User Interface

- **React.js:** Frontend development using React.js for a dynamic and responsive user experience.
- **CSS Styling:** Use of CSS for styling and visual presentation of the user interface.

### Development and Contribution

1. **Development Environment Setup:**

   Ensure you have the following prerequisites installed before starting development:

   - Node.js and npm
   - DFX (Dfinity SDK)
   - Internet Identity configured

2. **Steps to Contribute:**

   - Clone the repository.
   - Create a new branch for your feature or bug fix:
     ```bash
     git checkout -b your-branch-name
     ```
   - Make the necessary changes and commit them:
     ```bash
     git commit -m "Description of your changes"
     ```
   - Push to the branch you created:
     ```bash
     git push origin your-branch-name
     ```
   - Create a Pull Request on GitHub for your changes to be reviewed and merged.

### Frequently Asked Questions

- **How can I restart the development environment?**
  To restart the development environment, you can stop and restart the DFX service:

  ```bash
  dfx stop
  dfx start --background --clean
  ```

- **How can I check the deployment status of the canisters?**
  You can use the `dfx canister status` command to check the deployment status of the canisters:

  ```bash
  dfx canister status canister_name
  ```

- **Where can I find more information about using DFX, Motoko and ICP?**
  The official Internet Computer documentation provides detailed guides and examples on using DFX and developing in Motoko and other languages. Visit [Internet Computer Developer Documentation](https://internetcomputer.org/docs/current/home).

```

```
