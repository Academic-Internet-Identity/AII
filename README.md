# Academic Internet Identity

## Description

The AII (School Management Platform) is a system developed for efficient management of users, subjects, and schedules at the Universidad Tecnológica Metropolitana de Aguascalientes (UTMA), with the possibility of expanding the scope. The system allows the management of profiles for students, administrative staff, and teachers, as well as integrating functionalities for querying information through HTTP calls to external APIs.

## Features

- Registration and management of users with different roles: students, administrative staff, and teachers.
- Management of subjects and schedules. (Developing)
- Creation and management of groups and assignment of subjects. (Developing)
- Integration with external APIs for data querying.
- Administration panel for approval of registrations.
- User interface developed in React.
- Backend developed in Motoko

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
   git clone https://github.com/Academic-Internet-Identity/AII.git
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

- To deploy your Internet Computer application locally, you need to use the `deps`.

    ```bash
    dfx deps deploy
    ```

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

