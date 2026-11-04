const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airport Duty Management API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for the Airport Protocol & Duty Management System.',
    },
    servers: [
      { url: '/api/v1', description: 'Current host (relative)' },
      { url: 'http://localhost:5000/api/v1', description: 'Local development server' },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication, OTP verification, password management & push notification tokens' },
      { name: 'Duties', description: 'Duty scheduling, officer assignment, claiming, acknowledging, updating & PDF attachments' },
      { name: 'Officers', description: 'Officer user management and login access controls (Admin only)' },
      { name: 'Airports', description: 'Airports and terminal master management' },
      { name: 'Cities', description: 'Route cities master management' },
      { name: 'Contacts', description: 'Airport terminal emergency contacts directory' },
      { name: 'Reports', description: 'Summary statistics and downloadable PDF reports' },
      { name: 'Boarding Pass', description: 'Base64 PDF text extraction for boarding passes' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // ── Shared / Common ──
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation completed successfully' },
          },
        },

        // ── Auth Schemas ──
        SendOtpRequest: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', example: 'admin', description: 'Username, email address, or phone number' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        SendOtpResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'OTP sent to 90******00' },
            userId: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            maskedEmail: { type: 'string', example: 'ad***@airport.com' },
            otp: { type: 'string', example: '123456', description: 'Returned in development environment or when SMS delivery fails' },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['userId', 'otp'],
          properties: {
            userId: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            otp: { type: 'string', example: '123456' },
          },
        },
        ResendOtpRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'oldPassword123' },
            newPassword: { type: 'string', example: 'newSecurePassword456', minLength: 6 },
          },
        },
        FcmTokenRequest: {
          type: 'object',
          required: ['fcmToken'],
          properties: {
            fcmToken: { type: 'string', example: 'eK8Z...device_fcm_token' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
            role: { type: 'string', enum: ['ADMIN', 'OFFICER'] },
            user: { $ref: '#/components/schemas/User' },
          },
        },

        // ── User Schema ──
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Admin User' },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@airport.com' },
            phone: { type: 'string', example: '9000000000' },
            employeeId: { type: 'string', example: 'EMP001' },
            role: { type: 'string', enum: ['ADMIN', 'OFFICER'] },
            isEnabled: { type: 'boolean', example: true },
            fcmToken: { type: 'string', nullable: true, example: null },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Officer Schemas ──
        AddOfficerRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'employeeId', 'password'],
          properties: {
            name: { type: 'string', example: 'Rajesh Kumar' },
            email: { type: 'string', example: 'rajesh@airport.com' },
            phone: { type: 'string', example: '9876543210' },
            employeeId: { type: 'string', example: 'EMP002' },
            password: { type: 'string', example: 'officer123' },
          },
        },
        UpdateOfficerRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Rajesh Kumar' },
            email: { type: 'string', example: 'rajesh@airport.com' },
            phone: { type: 'string', example: '9876543210' },
            employeeId: { type: 'string', example: 'EMP002' },
          },
        },
        ToggleAccessRequest: {
          type: 'object',
          required: ['isEnabled'],
          properties: {
            isEnabled: { type: 'boolean', example: true },
          },
        },

        // ── Duty Schemas ──
        DutyAttachment: {
          type: 'object',
          properties: {
            hasFile: { type: 'boolean', example: true },
            fileId: { type: 'string', example: 'b0a701fa-8a56-4c48-b0a6-57cb5a409748' },
            filename: { type: 'string', example: 'BoardingPass.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 104230 },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        DutyIncentive: {
          type: 'object',
          properties: {
            eligible: { type: 'boolean', example: true },
            amount: { type: 'number', example: 500 },
          },
        },
        Duty: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa34b5c6d7e8f9a0b1c2d3' },
            officerId: { type: 'string', nullable: true, example: '66fa12b3c4d5e6f7a8b9c0d1' },
            officerName: { type: 'string', example: 'Rajesh Kumar' },
            travellerName: { type: 'string', example: 'Hon. Minister' },
            travellerDesignation: { type: 'string', example: 'VIP Guest' },
            travellerPhone: { type: 'string', example: '9876543210' },
            airportAuthorityPhone: { type: 'string', example: '022-26264000' },
            date: { type: 'string', example: '2024-08-15' },
            reportingTime: { type: 'string', example: '08:30 AM' },
            guestArrivalTime: { type: 'string', nullable: true, example: '09:15 AM' },
            officeType: { type: 'string', enum: ['REGULAR', 'BEFORE_OFFICE', 'AFTER_OFFICE', 'HOLIDAY'], example: 'BEFORE_OFFICE' },
            from: { type: 'string', example: 'Mumbai' },
            to: { type: 'string', example: 'Delhi' },
            airline: { type: 'string', example: 'Air India' },
            flightNo: { type: 'string', example: 'AI 101' },
            pnrNo: { type: 'string', example: 'ABC123XYZ' },
            flightTime: { type: 'string', example: '10:00 AM' },
            airportId: { type: 'string', example: '66fa1000c4d5e6f7a8b9c001' },
            airportName: { type: 'string', example: 'Chhatrapati Shivaji Maharaj International Airport' },
            terminalId: { type: 'string', example: '66fa1000c4d5e6f7a8b9c002' },
            terminalName: { type: 'string', example: 'Terminal 2' },
            arrivalDeparture: { type: 'string', enum: ['ARRIVAL', 'DEPARTURE'], example: 'DEPARTURE' },
            noOfPassengers: { type: 'integer', example: 1 },
            officerConfirmed: { type: 'boolean', example: false },
            status: { type: 'string', enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'], example: 'UPCOMING' },
            incentive: { $ref: '#/components/schemas/DutyIncentive' },
            pdfAttachment: { $ref: '#/components/schemas/DutyAttachment' },
            createdBy: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateDutyRequest: {
          type: 'object',
          required: [
            'date',
            'reportingTime',
            'officeType',
            'from',
            'to',
            'flightNo',
            'flightTime',
            'airportId',
            'airportName',
            'terminalId',
            'terminalName',
            'arrivalDeparture',
          ],
          properties: {
            date: { type: 'string', example: '2024-08-15' },
            reportingTime: { type: 'string', example: '08:30 AM' },
            guestArrivalTime: { type: 'string', example: '09:15 AM' },
            officeType: { type: 'string', enum: ['REGULAR', 'BEFORE_OFFICE', 'AFTER_OFFICE', 'HOLIDAY'], example: 'BEFORE_OFFICE' },
            from: { type: 'string', example: 'Mumbai' },
            to: { type: 'string', example: 'Delhi' },
            airline: { type: 'string', example: 'Air India' },
            flightNo: { type: 'string', example: 'AI 101' },
            pnrNo: { type: 'string', example: 'ABC123XYZ' },
            flightTime: { type: 'string', example: '10:00 AM' },
            airportId: { type: 'string', example: '66fa1000c4d5e6f7a8b9c001' },
            airportName: { type: 'string', example: 'Chhatrapati Shivaji Maharaj International Airport' },
            terminalId: { type: 'string', example: '66fa1000c4d5e6f7a8b9c002' },
            terminalName: { type: 'string', example: 'Terminal 2' },
            arrivalDeparture: { type: 'string', enum: ['ARRIVAL', 'DEPARTURE'], example: 'DEPARTURE' },
            noOfPassengers: { type: 'integer', default: 1, example: 1 },
            travellerName: { type: 'string', example: 'Hon. Minister' },
            travellerDesignation: { type: 'string', example: 'VIP Guest' },
            travellerPhone: { type: 'string', example: '9876543210' },
            airportAuthorityPhone: { type: 'string', example: '022-26264000' },
            officerId: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            officerName: { type: 'string', example: 'Rajesh Kumar' },
          },
        },
        UpdateDutyRequest: {
          type: 'object',
          properties: {
            date: { type: 'string', example: '2024-08-15' },
            reportingTime: { type: 'string', example: '08:30 AM' },
            guestArrivalTime: { type: 'string', example: '09:15 AM' },
            officeType: { type: 'string', enum: ['REGULAR', 'BEFORE_OFFICE', 'AFTER_OFFICE', 'HOLIDAY'] },
            from: { type: 'string', example: 'Mumbai' },
            to: { type: 'string', example: 'Delhi' },
            airline: { type: 'string', example: 'Air India' },
            flightNo: { type: 'string', example: 'AI 101' },
            pnrNo: { type: 'string', example: 'ABC123XYZ' },
            flightTime: { type: 'string', example: '10:00 AM' },
            airportId: { type: 'string' },
            airportName: { type: 'string' },
            terminalId: { type: 'string' },
            terminalName: { type: 'string' },
            arrivalDeparture: { type: 'string', enum: ['ARRIVAL', 'DEPARTURE'] },
            noOfPassengers: { type: 'integer', example: 1 },
            travellerName: { type: 'string' },
            travellerDesignation: { type: 'string' },
            travellerPhone: { type: 'string' },
            airportAuthorityPhone: { type: 'string' },
            remark: { type: 'string' },
          },
        },
        AssignOfficerRequest: {
          type: 'object',
          required: ['officerId'],
          properties: {
            officerId: { type: 'string', example: '66fa12b3c4d5e6f7a8b9c0d1' },
            officerName: { type: 'string', example: 'Rajesh Kumar', description: 'Optional; auto-resolved if omitted' },
          },
        },
        UpdateDutyStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'], example: 'COMPLETED' },
          },
        },
        UploadDutyPdfRequest: {
          type: 'object',
          required: ['data'],
          properties: {
            data: { type: 'string', description: 'Base64 encoded PDF string (max 5 MB)', example: 'JVBERi0xLjQKJ...' },
            filename: { type: 'string', example: 'BoardingPass.pdf', default: 'document.pdf' },
            mimeType: { type: 'string', example: 'application/pdf', default: 'application/pdf' },
          },
        },
        DutyPdfMetadataResponse: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: 'BoardingPass.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            size: { type: 'integer', example: 104230 },
            fileId: { type: 'string', example: 'b0a701fa-8a56-4c48-b0a6-57cb5a409748' },
          },
        },
        DutyListResponse: {
          type: 'object',
          properties: {
            duties: { type: 'array', items: { $ref: '#/components/schemas/Duty' } },
            total: { type: 'integer', example: 45 },
            hasMore: { type: 'boolean', example: true },
          },
        },

        // ── Airport & Terminal Schemas ──
        Airport: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa1000c4d5e6f7a8b9c001' },
            name: { type: 'string', example: 'Chhatrapati Shivaji Maharaj International Airport' },
            code: { type: 'string', example: 'BOM' },
            city: { type: 'string', example: 'Mumbai' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAirportRequest: {
          type: 'object',
          required: ['name', 'code', 'city'],
          properties: {
            name: { type: 'string', example: 'Chhatrapati Shivaji Maharaj International Airport' },
            code: { type: 'string', example: 'BOM' },
            city: { type: 'string', example: 'Mumbai' },
          },
        },
        UpdateAirportRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'CSMIA Mumbai' },
            code: { type: 'string', example: 'BOM' },
            city: { type: 'string', example: 'Mumbai' },
          },
        },
        ToggleAirportRequest: {
          type: 'object',
          required: ['isActive'],
          properties: {
            isActive: { type: 'boolean', example: true },
          },
        },
        Terminal: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa1000c4d5e6f7a8b9c002' },
            airportId: { type: 'string', example: '66fa1000c4d5e6f7a8b9c001' },
            name: { type: 'string', example: 'Terminal 2' },
            code: { type: 'string', example: 'T2' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTerminalRequest: {
          type: 'object',
          required: ['name', 'code'],
          properties: {
            name: { type: 'string', example: 'Terminal 2' },
            code: { type: 'string', example: 'T2' },
          },
        },
        UpdateTerminalRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Terminal 2 (International)' },
            code: { type: 'string', example: 'T2' },
          },
        },
        ToggleTerminalRequest: {
          type: 'object',
          required: ['isActive'],
          properties: {
            isActive: { type: 'boolean', example: true },
          },
        },

        // ── City Schemas ──
        City: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa2000c4d5e6f7a8b9c001' },
            name: { type: 'string', example: 'Mumbai' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCityRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Chandigarh' },
          },
        },
        UpdateCityRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'New Delhi' },
          },
        },

        // ── Contact Schemas ──
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66fa3000c4d5e6f7a8b9c001' },
            name: { type: 'string', example: 'Vikram Singh' },
            phone: { type: 'string', example: '9876543214' },
            group: { type: 'string', enum: ['T1', 'T2', 'Ulve'], example: 'T1' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateContactRequest: {
          type: 'object',
          required: ['name', 'phone', 'group'],
          properties: {
            name: { type: 'string', example: 'Vikram Singh' },
            phone: { type: 'string', example: '9876543214' },
            group: { type: 'string', enum: ['T1', 'T2', 'Ulve'], example: 'T1' },
          },
        },
        UpdateContactRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Vikram Singh' },
            phone: { type: 'string', example: '9876543214' },
            group: { type: 'string', enum: ['T1', 'T2', 'Ulve'], example: 'T1' },
          },
        },

        // ── Boarding Pass Schemas ──
        ExtractPdfTextRequest: {
          type: 'object',
          required: ['base64'],
          properties: {
            base64: { type: 'string', description: 'Base64 encoded boarding pass PDF (max 8 MB)', example: 'JVBERi0xLjQKJ...' },
            fileName: { type: 'string', example: 'BoardingPass.pdf' },
          },
        },
        ExtractPdfTextResponse: {
          type: 'object',
          properties: {
            text: { type: 'string', example: 'BOARDING PASS\nPASSENGER: JOHN DOE\nFLIGHT: 6E 201\nFROM: BOM TO: DEL' },
          },
        },

        // ── Report Schemas ──
        DutyReportSummary: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 50 },
            completed: { type: 'integer', example: 40 },
            upcoming: { type: 'integer', example: 8 },
            cancelled: { type: 'integer', example: 2 },
            totalIncentive: { type: 'number', example: 10000 },
          },
        },
        DutyReportResponse: {
          type: 'object',
          properties: {
            duties: { type: 'array', items: { $ref: '#/components/schemas/Duty' } },
            capped: { type: 'boolean', example: false },
            totalUnfiltered: { type: 'integer', example: 50 },
            summary: { $ref: '#/components/schemas/DutyReportSummary' },
          },
        },
        SubordinateReportItem: {
          type: 'object',
          properties: {
            officer: { $ref: '#/components/schemas/User' },
            totalDuties: { type: 'integer', example: 25 },
            completed: { type: 'integer', example: 20 },
            upcoming: { type: 'integer', example: 4 },
            cancelled: { type: 'integer', example: 1 },
            beforeOffice: { type: 'integer', example: 10 },
            afterOffice: { type: 'integer', example: 6 },
            totalIncentive: { type: 'number', example: 8000 },
            officeTimeDuty: { type: 'integer', example: 7 },
            holidayBeforeAfterDuty: { type: 'integer', example: 18 },
          },
        },
      },
    },

    paths: {
      // ══════════════════════════════════════════════════════════
      // AUTH ROUTES (/api/v1/auth)
      // ══════════════════════════════════════════════════════════
      '/auth/send-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Send 6-digit login OTP via SMS',
          description: 'Validates user credentials (username, email, or phone + password). If valid and account enabled, generates a 6-digit OTP, dispatches it via SMS, and returns userId. In development mode, the OTP is included in the response.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SendOtpRequest' } } },
          },
          responses: {
            200: {
              description: 'OTP dispatched successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SendOtpResponse' } } },
            },
            400: { description: 'Missing identifier or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Account disabled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP and complete login',
          description: 'Validates the 6-digit OTP for the specified user. On success, issues a JWT token and returns user details.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } },
          },
          responses: {
            200: {
              description: 'Login successful, returns JWT and user profile',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
            },
            400: { description: 'Missing userId or otp', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/resend-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Resend fresh OTP via SMS',
          description: 'Generates and resends a new 6-digit OTP if previous OTP expired or was not delivered.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ResendOtpRequest' } } },
          },
          responses: {
            200: {
              description: 'OTP resent successfully',
              content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, otp: { type: 'string' } } } } },
            },
            400: { description: 'Missing userId', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Account disabled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout current user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logged out successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/fcm-token': {
        post: {
          tags: ['Auth'],
          summary: 'Save FCM device token for push notifications',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FcmTokenRequest' } } },
          },
          responses: {
            200: {
              description: 'FCM token saved successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
            },
            400: { description: 'fcmToken required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/auth/change-password': {
        post: {
          tags: ['Auth'],
          summary: 'Change password for logged-in user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
          },
          responses: {
            200: {
              description: 'Password changed successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
            },
            400: { description: 'Missing fields or password less than 6 characters', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Current password is incorrect or unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // DUTIES ROUTES (/api/v1/duties)
      // ══════════════════════════════════════════════════════════
      '/duties': {
        get: {
          tags: ['Duties'],
          summary: 'List duties with filters and pagination',
          description: 'Fetches paginated duties. Automatically updates passed UPCOMING duties to COMPLETED. For officers, shows all duties unless mine=true is specified.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'] }, description: 'Filter by duty status' },
            { in: 'query', name: 'officerId', schema: { type: 'string' }, description: 'Filter by assigned officer (Admin only)' },
            { in: 'query', name: 'airportId', schema: { type: 'string' }, description: 'Filter by airport ID' },
            { in: 'query', name: 'terminalId', schema: { type: 'string' }, description: 'Filter by terminal ID' },
            { in: 'query', name: 'dateFrom', schema: { type: 'string', example: '2024-08-01' }, description: 'Start date filter (YYYY-MM-DD)' },
            { in: 'query', name: 'dateTo', schema: { type: 'string', example: '2024-08-31' }, description: 'End date filter (YYYY-MM-DD)' },
            { in: 'query', name: 'mine', schema: { type: 'string', enum: ['true', 'false'] }, description: 'For Officers: set "true" to filter to own duties' },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
          ],
          responses: {
            200: {
              description: 'Paginated list of duties',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/DutyListResponse' } } },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          tags: ['Duties'],
          summary: 'Create a new duty (Admin only)',
          description: 'Schedules a duty. If officerId is supplied, an instant Firebase push notification is sent to the assigned officer.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDutyRequest' } } },
          },
          responses: {
            201: {
              description: 'Duty scheduled successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}': {
        get: {
          tags: ['Duties'],
          summary: 'Get duty by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Duty details',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          tags: ['Duties'],
          summary: 'Update duty details (Admin only)',
          description: 'Updates fields on an existing duty such as schedule, passenger info, flight details, or terminal.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDutyRequest' } } },
          },
          responses: {
            200: {
              description: 'Duty updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Duties'],
          summary: 'Delete duty (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Duty deleted successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/assign': {
        patch: {
          tags: ['Duties'],
          summary: 'Assign duty to an officer (Admin only)',
          description: 'Assigns duty to specified officer and sends push notification alert to their mobile device.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignOfficerRequest' } } },
          },
          responses: {
            200: {
              description: 'Officer assigned',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/claim': {
        patch: {
          tags: ['Duties'],
          summary: 'Self-claim an open duty (Officer)',
          description: 'Allows an officer to claim an unassigned duty. Sends push notifications to all Admins.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Duty claimed successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Duty already claimed by another officer', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/release': {
        patch: {
          tags: ['Duties'],
          summary: 'Release a previously claimed duty (Officer)',
          description: 'Allows the assigned officer to give up/unclaim the duty.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Duty released',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            403: { description: 'Forbidden — You have not claimed this duty', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/confirm': {
        patch: {
          tags: ['Duties'],
          summary: 'Confirm / acknowledge duty assignment (Officer)',
          description: 'Marks officerConfirmed as true. Alerts Admins via Firebase push notifications.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Duty confirmed',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            403: { description: 'Forbidden — not assigned to this duty', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/status': {
        patch: {
          tags: ['Duties'],
          summary: 'Update duty status',
          description: 'Updates duty status to UPCOMING, COMPLETED, or CANCELLED.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDutyStatusRequest' } } },
          },
          responses: {
            200: {
              description: 'Status updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            400: { description: 'Invalid status value', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/pdf': {
        post: {
          tags: ['Duties'],
          summary: 'Upload attached PDF document (Base64)',
          description: 'Uploads a PDF (max 5 MB) encoded as Base64 directly into MongoDB. Computes MD5 checksum for deduplication.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadDutyPdfRequest' } } },
          },
          responses: {
            200: {
              description: 'PDF stored, duty returned with attachment metadata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Duty' } } },
            },
            400: { description: 'File exceeds 5MB or no data provided', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Duty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        get: {
          tags: ['Duties'],
          summary: 'Get attached PDF metadata',
          description: 'Returns file details (filename, mimeType, size, fileId) without loading the binary buffer.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'PDF metadata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/DutyPdfMetadataResponse' } } },
            },
            404: { description: 'Duty or file not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/duties/{id}/pdf/view': {
        get: {
          tags: ['Duties'],
          summary: 'Stream / preview attached PDF',
          description: 'Streams the attached PDF directly to the client browser or mobile viewer. Authentication can be provided via Authorization header or ?token= query parameter.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'token', required: false, schema: { type: 'string' }, description: 'Alternative JWT token parameter for direct file previewing in browsers' },
          ],
          responses: {
            200: {
              description: 'PDF stream',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
            },
            404: { description: 'Duty or PDF not found' },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // OFFICERS ROUTES (/api/v1/officers)
      // ══════════════════════════════════════════════════════════
      '/officers': {
        get: {
          tags: ['Officers'],
          summary: 'List all protocol officers (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Array of officer users',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          tags: ['Officers'],
          summary: 'Register a new protocol officer (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddOfficerRequest' } } },
          },
          responses: {
            201: {
              description: 'Officer created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            400: { description: 'Employee ID or email already exists / missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/officers/{id}': {
        put: {
          tags: ['Officers'],
          summary: 'Update officer details (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOfficerRequest' } } },
          },
          responses: {
            200: {
              description: 'Officer updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Officer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/officers/{id}/access': {
        patch: {
          tags: ['Officers'],
          summary: 'Enable or disable officer login access (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ToggleAccessRequest' } } },
          },
          responses: {
            200: {
              description: 'Officer access toggled',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Officer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // AIRPORTS & TERMINALS ROUTES (/api/v1/airports)
      // ══════════════════════════════════════════════════════════
      '/airports': {
        get: {
          tags: ['Airports'],
          summary: 'List all airports',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Array of airports',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Airport' } } } },
            },
          },
        },
        post: {
          tags: ['Airports'],
          summary: 'Create an airport (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAirportRequest' } } },
          },
          responses: {
            201: {
              description: 'Airport created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Airport' } } },
            },
            400: { description: 'Name, code, and city are required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/airports/{id}': {
        patch: {
          tags: ['Airports'],
          summary: 'Update airport (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAirportRequest' } } },
          },
          responses: {
            200: {
              description: 'Airport updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Airport' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Airport not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/airports/{id}/toggle': {
        patch: {
          tags: ['Airports'],
          summary: 'Toggle active status of airport (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ToggleAirportRequest' } } },
          },
          responses: {
            200: {
              description: 'Airport status updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Airport' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Airport not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/airports/{airportId}/terminals': {
        get: {
          tags: ['Airports'],
          summary: 'List terminals for an airport',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'airportId', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Array of terminals',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Terminal' } } } },
            },
          },
        },
        post: {
          tags: ['Airports'],
          summary: 'Add a terminal to an airport (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'airportId', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTerminalRequest' } } },
          },
          responses: {
            201: {
              description: 'Terminal created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Terminal' } } },
            },
            400: { description: 'Name and code are required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Airport not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/airports/{airportId}/terminals/{terminalId}': {
        patch: {
          tags: ['Airports'],
          summary: 'Update terminal details (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'airportId', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'terminalId', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTerminalRequest' } } },
          },
          responses: {
            200: {
              description: 'Terminal updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Terminal' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Terminal not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/airports/{airportId}/terminals/{terminalId}/toggle': {
        patch: {
          tags: ['Airports'],
          summary: 'Toggle active status of terminal (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'airportId', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'terminalId', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ToggleTerminalRequest' } } },
          },
          responses: {
            200: {
              description: 'Terminal status updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Terminal' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Terminal not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // CITIES ROUTES (/api/v1/cities)
      // ══════════════════════════════════════════════════════════
      '/cities': {
        get: {
          tags: ['Cities'],
          summary: 'List all active route cities',
          description: 'Fetches active route cities sorted alphabetically. Automatically initializes 25 major Indian default cities if empty.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Array of cities',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/City' } } } },
            },
          },
        },
        post: {
          tags: ['Cities'],
          summary: 'Add a new city (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCityRequest' } } },
          },
          responses: {
            201: {
              description: 'City created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/City' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/cities/{id}': {
        patch: {
          tags: ['Cities'],
          summary: 'Update city name (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCityRequest' } } },
          },
          responses: {
            200: {
              description: 'City updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/City' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/cities/{id}/toggle': {
        patch: {
          tags: ['Cities'],
          summary: 'Toggle active status of city (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'City status toggled',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/City' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // CONTACTS ROUTES (/api/v1/contacts)
      // ══════════════════════════════════════════════════════════
      '/contacts': {
        get: {
          tags: ['Contacts'],
          summary: 'List terminal emergency contacts',
          description: 'Fetches emergency terminal contacts with optional terminal group filtering (T1, T2, Ulve). Automatically populates default directory if empty.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'group', schema: { type: 'string', enum: ['T1', 'T2', 'Ulve'] }, description: 'Filter by terminal group' },
          ],
          responses: {
            200: {
              description: 'Array of contacts',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contact' } } } },
            },
          },
        },
        post: {
          tags: ['Contacts'],
          summary: 'Add a new emergency contact (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateContactRequest' } } },
          },
          responses: {
            201: {
              description: 'Contact created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } },
            },
            400: { description: 'Invalid group or missing name/phone', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/contacts/{id}': {
        put: {
          tags: ['Contacts'],
          summary: 'Update emergency contact (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateContactRequest' } } },
          },
          responses: {
            200: {
              description: 'Contact updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Contact not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Contacts'],
          summary: 'Delete emergency contact (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Contact deleted',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Contact not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // REPORTS ROUTES (/api/v1/reports)
      // ══════════════════════════════════════════════════════════
      '/reports/duties': {
        get: {
          tags: ['Reports'],
          summary: 'Duty summary report with status and incentive totals',
          description: 'Calculates overall summary stats (completed, upcoming, cancelled, total incentive) and returns matching duties.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'officerId', schema: { type: 'string' }, description: 'Filter by officer (Admin only)' },
            { in: 'query', name: 'airportId', schema: { type: 'string' }, description: 'Filter by airport' },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'] } },
            { in: 'query', name: 'dateFrom', schema: { type: 'string', example: '2024-08-01' } },
            { in: 'query', name: 'dateTo', schema: { type: 'string', example: '2024-08-31' } },
          ],
          responses: {
            200: {
              description: 'Duty report data and summary totals',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/DutyReportResponse' } } },
            },
          },
        },
      },
      '/reports/duties/pdf': {
        get: {
          tags: ['Reports'],
          summary: 'Download Landscape PDF Duty Report',
          description: 'Generates and streams a formatted landscape PDF document summarizing duties for the selected date range and filters.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'officerId', schema: { type: 'string' } },
            { in: 'query', name: 'airportId', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'dateFrom', schema: { type: 'string' } },
            { in: 'query', name: 'dateTo', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Downloadable PDF file',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
            },
          },
        },
      },
      '/reports/subordinates': {
        get: {
          tags: ['Reports'],
          summary: 'Per-officer performance and incentive report (Admin only)',
          description: 'Summarizes duty breakdown (completed, upcoming, cancelled, before/after office, incentive earnings) for each officer.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'dateFrom', schema: { type: 'string', example: '2024-08-01' } },
            { in: 'query', name: 'dateTo', schema: { type: 'string', example: '2024-08-31' } },
          ],
          responses: {
            200: {
              description: 'Array of officer performance summaries',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SubordinateReportItem' } } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/reports/subordinates/pdf': {
        get: {
          tags: ['Reports'],
          summary: 'Download Portrait PDF Subordinate Report (Admin only)',
          description: 'Generates and streams a formatted portrait PDF report of officer duty and incentive statistics.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'dateFrom', schema: { type: 'string' } },
            { in: 'query', name: 'dateTo', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Downloadable PDF file',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
            },
            403: { description: 'Forbidden — Admins only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      // ══════════════════════════════════════════════════════════
      // BOARDING PASS ROUTES (/api/v1/boarding-pass)
      // ══════════════════════════════════════════════════════════
      '/boarding-pass/extract-text': {
        post: {
          tags: ['Boarding Pass'],
          summary: 'Extract raw text from Base64 encoded boarding pass PDF',
          description: 'Parses the uploaded PDF buffer and extracts text so mobile/web apps can auto-populate flight, passenger, and date details.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ExtractPdfTextRequest' } } },
          },
          responses: {
            200: {
              description: 'Parsed text content',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ExtractPdfTextResponse' } } },
            },
            400: { description: 'No file data provided', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            422: { description: 'File too large (> 8MB) or PDF parsing failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
