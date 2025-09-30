# University RFID Card Management System

A comprehensive university management system built with Next.js and TypeScript that integrates RFID card technology for student authentication, attendance tracking, library management, and canteen services.

## 🚀 Features

### Multi-Portal System

- **Admin Portal**: Complete system administration, student & lecturer management
- **Student Portal**: Academic performance tracking, attendance view, GPA monitoring
- **Lecturer Portal**: Attendance management, class scheduling, student reports
- **Library Portal**: Book management, checkout/return system, member administration
- **Canteen Portal**: Payment processing, transaction management, menu administration

### RFID Integration

- Real-time RFID card reading and writing
- NFC-based attendance tracking
- Secure card authentication
- Device status monitoring

### Core Functionality

- User authentication with NextAuth
- Real-time data synchronization with Socket.IO
- PostgreSQL database integration
- File upload and storage with Azure Blob Storage
- Email notifications and password reset
- Responsive UI with Tailwind CSS and shadcn/ui

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **State Management**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js
- **Database**: PostgreSQL
- **Authentication**: NextAuth
- **Real-time**: Socket.IO
- **Email**: Resend
- **File Storage**: Azure Blob Storage

### Hardware Integration

- **RFID/NFC**: nfc-pcsc library
- **Card Reading**: Custom middleware service
- **WebSocket**: Real-time card communication

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- RFID/NFC card reader hardware

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/viduwaa/uni-rfid.git
cd uni-rfid
```

### 2. Install Dependencies

```bash
# Install main application dependencies
npm install

# Install middleware dependencies
cd middleware
npm install
cd ..

# Install socket server dependencies
cd socket-server
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGHOST=your_postgres_host
PGPORT=5432
PGNAME=your_database_name


# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000


# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Socket.IO Configuration
SOCKET_PORT=3001
```

### 4. Database Setup

```bash
# Initialize the database with the provided SQL file
psql -U your_username -d your_database -f uni-nfc-final.sql

# Or run the initialization script
npm run db:init
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the main Next.js application
npm run dev

# In separate terminals, start the additional services:

# Start the Socket.IO server
npm run socket

# Start the NFC middleware
npm run nfc
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

The application will be available at:

- **Main App**: http://localhost:3000
- **Socket Server**: http://localhost:3001
- **NFC Middleware**: Connects to RFID readers

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin portal pages
│   │   ├── student/            # Student portal pages
│   │   ├── lecturer/           # Lecturer portal pages
│   │   ├── library/            # Library portal pages
│   │   ├── canteen/            # Canteen portal pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ...                 # Custom components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and configurations
│   ├── types/                  # TypeScript type definitions
│   └── scripts/                # Database and utility scripts
├── middleware/                 # NFC/RFID middleware service
├── socket-server/              # Socket.IO server
├── public/                     # Static assets
└── ...                         # Configuration files
```

## 🔧 API Routes

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/reset-password` - Password reset

### Student Management

- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Attendance

- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/[studentId]` - Get student attendance

### Library

- `GET /api/library/books` - Get all books
- `POST /api/library/checkout` - Checkout book
- `POST /api/library/return` - Return book

### Canteen

- `POST /api/canteen/transaction` - Process payment
- `GET /api/canteen/menu` - Get menu items

## 🏗 Key Components

### RFID Integration

```typescript
// Example usage of NFC reader hook
const { cardData, isReading, error } = useNFCReader();
```

### Real-time Features

```typescript
// Socket.IO integration for real-time updates
useEffect(() => {
    socket.on("cardRead", (data) => {
        // Handle card read event
    });
}, []);
```



## 🧪 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database
- `npm run socket` - Start Socket.IO server
- `npm run nfc` - Start NFC middleware

## 🔒 Security Features

- **Authentication**: Secured with NextAuth
- **Authorization**: Role-based access control
- **Data Validation**: Server-side validation 
- **SQL Injection Prevention**: Parameterized queries
- **HTTPS**: SSL/TLS encryption support
- **CORS**: Configured for security

## 📱 Mobile Responsiveness

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🎨 UI/UX Features

- **Dark/Light Mode**: Theme switching capability
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: WCAG compliant components
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request





## 🐛 Troubleshooting

### Common Issues

**RFID Reader Not Working**

```bash
# Check if the NFC middleware is running
npm run nfc

# Verify hardware connections
# Check system permissions for NFC devices
```

**Database Connection Issues**

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check environment variables
echo $PGUSER $PGHOST $PGPORT
```

**Build Errors**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance Monitoring

The application includes:

- **Error Boundary**: React error boundaries for graceful error handling
- **Loading States**: Skeleton components for better UX
- **Caching**: Next.js built-in caching strategies
- **Optimization**: Image optimization and lazy loading

## 🔄 Database Schema

Key tables include:

- `students` - Student information and records
- `lecturers` - Lecturer profiles and permissions
- `attendance` - Attendance tracking data
- `library_books` - Book catalog and availability
- `canteen_transactions` - Payment and transaction records
- `rfid_cards` - Card assignments and status



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Clerk](https://clerk.dev/) for authentication services
- [Socket.IO](https://socket.io/) for real-time communication
- [nfc-pcsc](https://www.npmjs.com/package/nfc-pcsc) for NFC integration

---

**Built for university management and RFID integration as the 2nd year project at university**
