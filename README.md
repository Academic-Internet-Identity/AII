# UTMA School Management Platform

## Description

The UTMA School Management Platform is a system developed for efficient management of users, subjects, and schedules at the Universidad Tecnológica Metropolitana de Aguascalientes (UTMA). The system allows the management of profiles for students, administrative staff, and teachers, as well as integrating functionalities for querying information through HTTP calls to external APIs.

## Features

- Registration and management of users with different roles: students, administrative staff, and teachers.
- Management of subjects and schedules.
- Creation and management of groups and assignment of subjects.
- Integration with external APIs for data querying.
- Administration panel for approval of registrations.
- User interface developed in React.

## Technologies Used

- **Frontend:** React.js with CSS for styling.
- **Backend:** Motoko on the Internet Computer platform.
- **Authentication:** Internet Identity for user identity management.

## Environment Setup

### Prerequisites

- Node.js and npm installed
- DFX (Dfinity SDK) configured and running
- Internet Identity configured for local development

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AngelSaulCorreaMartinez/AII.git
   cd AII
   ```

2. **Install frontend dependencies:**

   ```bash
   cd AII_frontend
   npm install
   ```

3. **Verify Mops:**
   
   - Clone the Mops repository and build the tool:
     ```bash
     git clone https://github.com/ZenVoich/mops.git
     cd mops/cli
     npm install
     npm link
     ```

   - Navigate to your project directory and initialize Mops in your project:
     ```bash
     cd ../../AII
     mops init
     ```

   - Add the necessary dependencies using Mops:
     ```bash
     mops add base
     mops add Map
     mops install
     ```

4. **Deploy the project:**

   ```bash
   cd ../AII_backend
   dfx start --background
   dfx deploy
   ```

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
  dfx start --background
  ```

- **How can I check the deployment status of the canisters?**
  You can use the `dfx canister status` command to check the deployment status of the canisters:
  ```bash
  dfx canister status canister_name
  ```

- **Where can I find more information about using DFX and Motoko?**
  The official Dfinity documentation provides detailed guides and examples on using DFX and developing in Motoko. Visit [Internet Computer Developer Documentation](https://smartcontracts.org/docs/developers-guide/introducing-ic.html).

### API Endpoints and External Integration

1. **External API Integration:**
   - The platform includes functionalities to make HTTP requests to external APIs to fetch data or verify existing information.

2. **Endpoints:**
   - Detailed documentation for each endpoint provided by the external APIs should be referenced here.

### System Architecture

1. **Frontend:**
   - Built with React.js, providing a responsive and dynamic user interface.
   - Styled using CSS for a modern and clean look.

2. **Backend:**
   - Developed in Motoko, deployed on the Internet Computer.
   - Handles user authentication, data storage, and business logic.

3. **Database:**
   - The Internet Computer's stable storage is used for data persistence.

4. **Authentication:**
   - Managed by Internet Identity, ensuring secure and seamless user login.

### Deployment and Hosting

- **Internet Computer:**
  - The backend is deployed on the Internet Computer, leveraging its decentralized infrastructure.
  - Ensure DFX is configured correctly to deploy the canisters.

- **Local Development:**
  - Use `dfx start` to run a local replica of the Internet Computer for development and testing.

### Contributing to the Project

We welcome contributions from the community! To contribute, follow these steps:

1. **Fork the Repository:**
   - Click the "Fork" button at the top right corner of the repository page on GitHub.

2. **Clone Your Fork:**
   - Clone your forked repository to your local machine:
     ```bash
     git clone https://github.com/your-username/AII.git
     cd AII
     ```

3. **Create a New Branch:**
   - Create a new branch for your changes:
     ```bash
     git checkout -b feature/your-feature-name
     ```

4. **Make Your Changes:**
   - Make the necessary changes in your local repository.

5. **Commit Your Changes:**
   - Commit your changes with a descriptive message:
     ```bash
     git commit -m "Add your commit message here"
     ```

6. **Push Your Changes:**
   - Push your changes to your forked repository:
     ```bash
     git push origin feature/your-feature-name
     ```

7. **Create a Pull Request:**
   - Open a pull request from your forked repository to the main repository.
