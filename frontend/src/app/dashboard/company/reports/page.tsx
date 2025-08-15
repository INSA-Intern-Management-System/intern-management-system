// "use client";

// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import {
//   FileText,
//   Search,
//   Star,
//   CheckCircle,
//   Clock,
//   Download,
//   MessageSquare,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";

// type Report = {
//   id: number;
//   student: string;
//   week: string;
//   project: string;
//   submitted: boolean;
//   submittedOn: string | null;
//   dueDate: string;
//   status: "reviewed" | "pending" | "overdue";
//   rating: number | null;
//   feedback: string | null;
//   mentor: string;
//   tasksCompleted: string[];
//   challenges: string;
//   nextWeekGoals: string[];
// };

// const initialReports: Report[] = [
//   {
//     id: 1,
//     student: "Sophie Laurent",
//     week: "Week 8",
//     project: "Mobile App Redesign",
//     submitted: true,
//     submittedOn: "2024-02-19",
//     dueDate: "2024-02-19",
//     status: "reviewed",
//     rating: 5,
//     feedback:
//       "Excellent progress on the UI components. Great attention to detail and user experience.",
//     mentor: "Sarah Wilson",
//     tasksCompleted: [
//       "Completed user authentication flow",
//       "Designed onboarding screens",
//       "Implemented responsive navigation",
//     ],
//     challenges: "Minor issues with cross-platform compatibility",
//     nextWeekGoals: ["Finalize payment integration", "Conduct user testing"],
//   },
//   {
//     id: 2,
//     student: "Pierre Martin",
//     week: "Week 6",
//     project: "Customer Analytics Dashboard",
//     submitted: true,
//     submittedOn: "2024-02-18",
//     dueDate: "2024-02-19",
//     status: "pending",
//     rating: null,
//     feedback: null,
//     mentor: "Tom Davis",
//     tasksCompleted: [
//       "Set up data pipeline",
//       "Created initial dashboard mockups",
//       "Implemented basic filtering",
//     ],
//     challenges: "Performance optimization for large datasets",
//     nextWeekGoals: [
//       "Optimize query performance",
//       "Add advanced visualizations",
//     ],
//   },
//   {
//     id: 3,
//     student: "Marie Dubois",
//     week: "Week 4",
//     project: "E-commerce Platform",
//     submitted: false,
//     submittedOn: null,
//     dueDate: "2024-02-20",
//     status: "overdue",
//     rating: null,
//     feedback: null,
//     mentor: "Alex Johnson",
//     tasksCompleted: [],
//     challenges: "",
//     nextWeekGoals: [],
//   },
//   {
//     id: 4,
//     student: "Sophie Laurent",
//     week: "Week 7",
//     project: "Mobile App Redesign",
//     submitted: true,
//     submittedOn: "2024-02-12",
//     dueDate: "2024-02-12",
//     status: "reviewed",
//     rating: 4,
//     feedback:
//       "Good progress on the design system. Consider improving accessibility features.",
//     mentor: "Sarah Wilson",
//     tasksCompleted: [
//       "Created design system",
//       "Implemented dark mode",
//       "Updated color palette",
//     ],
//     challenges: "Ensuring consistency across different screen sizes",
//     nextWeekGoals: [
//       "Implement accessibility features",
//       "Start user authentication",
//     ],
//   },
// ];

// export default function CompanyReportsPage() {
//   const [reports, setReports] = useState<Report[]>(initialReports);
//   const [feedbackModal, setFeedbackModal] = useState<{
//     open: boolean;
//     reportId: number | null;
//   }>({ open: false, reportId: null });
//   const [feedbackValue, setFeedbackValue] = useState("");
//   const [page, setPage] = useState(1);
//   const pageSize = 3;

//   // Filters
//   const [searchValue, setSearchValue] = useState("");
//   const [statusFilter, setStatusFilter] = useState<
//     "all" | "pending" | "reviewed" | "overdue"
//   >("all");
//   const [weekFilter, setWeekFilter] = useState<
//     "all" | "current" | "last" | "month"
//   >("all");

//   // Filtering logic
//   const filteredReports = reports.filter((report) => {
//     const matchesSearch =
//       searchValue.trim() === "" ||
//       report.student.toLowerCase().includes(searchValue.toLowerCase()) ||
//       report.project.toLowerCase().includes(searchValue.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || report.status === statusFilter;
//     // Week filter (simple demo logic)
//     const matchesWeek =
//       weekFilter === "all" ||
//       (weekFilter === "current" && report.week === "Week 8") ||
//       (weekFilter === "last" && report.week === "Week 7") ||
//       (weekFilter === "month" &&
//         ["Week 8", "Week 7", "Week 6", "Week 5"].includes(report.week));
//     return matchesSearch && matchesStatus && matchesWeek;
//   });

//   const totalPages = Math.ceil(filteredReports.length / pageSize);
//   const paginatedReports = filteredReports.slice(
//     (page - 1) * pageSize,
//     page * pageSize
//   );

//   // Reset page on filter/search change
//   const handleFilterChange = (setter: (v: never) => void) => (v: never) => {
//     setter(v);
//     setPage(1);
//   };
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(e.target.value);
//     setPage(1);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "reviewed":
//         return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
//       case "pending":
//         return (
//           <Badge className="bg-yellow-100 text-yellow-800">
//             Pending Review
//           </Badge>
//         );
//       case "overdue":
//         return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "reviewed":
//         return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case "pending":
//         return <Clock className="h-5 w-5 text-yellow-600" />;
//       case "overdue":
//         return <Clock className="h-5 w-5 text-red-600" />;
//       default:
//         return <FileText className="h-5 w-5 text-gray-600" />;
//     }
//   };

//   // const submittedReports = reports.filter((report) => report.submitted);
//   const pendingReports = reports.filter(
//     (report) => report.status === "pending"
//   );
//   const overdueReports = reports.filter(
//     (report) => report.status === "overdue"
//   );

//   const openFeedback = (report: Report) => {
//     setFeedbackModal({ open: true, reportId: report.id });
//     setFeedbackValue(report.feedback || "");
//   };
//   const handleFeedbackSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setReports((reports) =>
//       reports.map((r) =>
//         r.id === feedbackModal.reportId ? { ...r, feedback: feedbackValue } : r
//       )
//     );
//     setFeedbackModal({ open: false, reportId: null });
//   };

//   return (
//     <DashboardLayout requiredRole="company">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
//             <p className="text-gray-600">
//               Review and evaluate intern progress reports
//             </p>
//           </div>
//           <Button variant="outline">
//             <Download className="h-4 w-4 mr-2" />
//             Export Reports
//           </Button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Total Reports
//                   </p>
//                   <p className="text-2xl font-bold">{reports.length}</p>
//                 </div>
//                 <FileText className="h-8 w-8 text-blue-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Pending Review
//                   </p>
//                   <p className="text-2xl font-bold text-yellow-600">
//                     {pendingReports.length}
//                   </p>
//                 </div>
//                 <Clock className="h-8 w-8 text-yellow-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Overdue</p>
//                   <p className="text-2xl font-bold text-red-600">
//                     {overdueReports.length}
//                   </p>
//                 </div>
//                 <Clock className="h-8 w-8 text-red-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Avg. Rating
//                   </p>
//                   <p className="text-2xl font-bold text-purple-600">
//                     {(
//                       reports
//                         .filter((r) => r.rating)
//                         .reduce((sum, r) => sum + (r.rating || 0), 0) /
//                       (reports.filter((r) => r.rating).length || 1)
//                     ).toFixed(1)}
//                   </p>
//                 </div>
//                 <Star className="h-8 w-8 text-purple-600" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Search and Filter */}
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <Input
//                     placeholder="Search by student name or project..."
//                     className="pl-10"
//                     value={searchValue}
//                     onChange={handleSearchChange}
//                   />
//                 </div>
//               </div>
//               <Select
//                 value={statusFilter}
//                 onValueChange={handleFilterChange(setStatusFilter)}
//               >
//                 <SelectTrigger className="w-48">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Reports</SelectItem>
//                   <SelectItem value="pending">Pending Review</SelectItem>
//                   <SelectItem value="reviewed">Reviewed</SelectItem>
//                   <SelectItem value="overdue">Overdue</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select
//                 value={weekFilter}
//                 onValueChange={handleFilterChange(setWeekFilter)}
//               >
//                 <SelectTrigger className="w-48">
//                   <SelectValue placeholder="Filter by week" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Weeks</SelectItem>
//                   <SelectItem value="current">Current Week</SelectItem>
//                   <SelectItem value="last">Last Week</SelectItem>
//                   <SelectItem value="month">This Month</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Reports List */}
//         <div className="space-y-4">
//           {paginatedReports.map((report) => (
//             <Card key={report.id} className="hover:shadow-md transition-shadow">
//               <CardContent className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-start space-x-4">
//                     <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
//                       {getStatusIcon(report.status)}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           {report.student} - {report.week}
//                         </h3>
//                         {getStatusBadge(report.status)}
//                         {report.rating && (
//                           <div className="flex items-center">
//                             <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                             <span className="text-sm text-gray-600 ml-1">
//                               {report.rating}/5
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             <strong>Project:</strong> {report.project}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             <strong>Mentor:</strong> {report.mentor}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             <strong>Due Date:</strong> {report.dueDate}
//                           </p>
//                           {report.submittedOn && (
//                             <p className="text-sm text-gray-600">
//                               <strong>Submitted:</strong> {report.submittedOn}
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           {report.submitted ? (
//                             <Badge className="bg-green-100 text-green-800">
//                               Submitted
//                             </Badge>
//                           ) : (
//                             <Badge className="bg-red-100 text-red-800">
//                               Not Submitted
//                             </Badge>
//                           )}
//                         </div>
//                       </div>

//                       {report.submitted && (
//                         <>
//                           <div className="mb-3">
//                             <h4 className="font-semibold text-sm mb-2">
//                               Tasks Completed:
//                             </h4>
//                             <ul className="text-sm text-gray-600 space-y-1">
//                               {report.tasksCompleted.map((task, index) => (
//                                 <li key={index} className="flex items-start">
//                                   <CheckCircle className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
//                                   {task}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>

//                           {report.challenges && (
//                             <div className="mb-3">
//                               <h4 className="font-semibold text-sm mb-2">
//                                 Challenges:
//                               </h4>
//                               <p className="text-sm text-gray-600">
//                                 {report.challenges}
//                               </p>
//                             </div>
//                           )}

//                           {report.nextWeekGoals.length > 0 && (
//                             <div className="mb-3">
//                               <h4 className="font-semibold text-sm mb-2">
//                                 Next Week Goals:
//                               </h4>
//                               <ul className="text-sm text-gray-600 space-y-1">
//                                 {report.nextWeekGoals.map((goal, index) => (
//                                   <li key={index} className="flex items-start">
//                                     <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
//                                     {goal}
//                                   </li>
//                                 ))}
//                               </ul>
//                             </div>
//                           )}

//                           {report.feedback && (
//                             <div className="p-3 bg-blue-50 rounded-lg">
//                               <h4 className="font-semibold text-sm mb-2 text-blue-900">
//                                 Mentor Feedback:
//                               </h4>
//                               <p className="text-sm text-blue-800">
//                                 {report.feedback}
//                               </p>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex flex-col space-y-2">
//                     {report.submitted ? (
//                       <>
//                         <Button variant="outline" size="sm">
//                           View Full Report
//                         </Button>
//                         {report.status === "pending" && (
//                           <Button size="sm">Review & Rate</Button>
//                         )}
//                         <Dialog
//                           open={
//                             feedbackModal.open &&
//                             feedbackModal.reportId === report.id
//                           }
//                           onOpenChange={(open) =>
//                             setFeedbackModal({
//                               open,
//                               reportId: open ? report.id : null,
//                             })
//                           }
//                         >
//                           <DialogTrigger asChild>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => openFeedback(report)}
//                             >
//                               <MessageSquare className="h-4 w-4 mr-2" />
//                               Feedback
//                             </Button>
//                           </DialogTrigger>
//                           <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl">
//                             <DialogHeader>
//                               <DialogTitle>Mentor Feedback</DialogTitle>
//                             </DialogHeader>
//                             <form
//                               className="space-y-4"
//                               onSubmit={handleFeedbackSubmit}
//                             >
//                               <textarea
//                                 className="w-full border rounded p-2 min-h-[100px]"
//                                 placeholder="Enter feedback for this report..."
//                                 value={feedbackValue}
//                                 onChange={(e) =>
//                                   setFeedbackValue(e.target.value)
//                                 }
//                               />
//                               <div className="flex space-x-2">
//                                 <Button type="submit">Save Feedback</Button>
//                                 <Button
//                                   type="button"
//                                   variant="outline"
//                                   onClick={() =>
//                                     setFeedbackModal({
//                                       open: false,
//                                       reportId: null,
//                                     })
//                                   }
//                                 >
//                                   Cancel
//                                 </Button>
//                               </div>
//                             </form>
//                           </DialogContent>
//                         </Dialog>
//                       </>
//                     ) : (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
//                       >
//                         Send Reminder
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Pagination */}
//         <Pagination className="mt-6">
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 href="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setPage((p) => Math.max(1, p - 1));
//                 }}
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, i) => (
//               <PaginationItem key={i}>
//                 <PaginationLink
//                   href="#"
//                   isActive={page === i + 1}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setPage(i + 1);
//                   }}
//                 >
//                   {i + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 href="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setPage((p) => Math.min(totalPages, p + 1));
//                 }}
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>

//         {/* Report Evaluation Guidelines */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Report Evaluation Guidelines</CardTitle>
//             <CardDescription>
//               Criteria for evaluating intern weekly reports
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <h4 className="font-semibold mb-3">Evaluation Criteria:</h4>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li>
//                     • <strong>Task Completion (30%):</strong> Quality and
//                     quantity of completed work
//                   </li>
//                   <li>
//                     • <strong>Problem Solving (25%):</strong> Approach to
//                     challenges and solutions
//                   </li>
//                   <li>
//                     • <strong>Learning Progress (20%):</strong> Skill
//                     development and knowledge gain
//                   </li>
//                   <li>
//                     • <strong>Communication (15%):</strong> Clarity and detail
//                     in reporting
//                   </li>
//                   <li>
//                     • <strong>Initiative (10%):</strong> Proactive behavior and
//                     self-direction
//                   </li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-3">Rating Scale:</h4>
//                 <ul className="space-y-2 text-sm text-gray-600">
//                   <li>
//                     • <strong>5 Stars:</strong> Exceptional performance, exceeds
//                     expectations
//                   </li>
//                   <li>
//                     • <strong>4 Stars:</strong> Good performance, meets
//                     expectations well
//                   </li>
//                   <li>
//                     • <strong>3 Stars:</strong> Satisfactory performance, meets
//                     basic expectations
//                   </li>
//                   <li>
//                     • <strong>2 Stars:</strong> Below expectations, needs
//                     improvement
//                   </li>
//                   <li>
//                     • <strong>1 Star:</strong> Poor performance, requires
//                     immediate attention
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }

"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  FileText,
  Search,
  Star,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  AlertTriangle,
  Mail,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Report = {
  id: number;
  student: string;
  week: string;
  project: string;
  submitted: boolean;
  submittedOn: string | null;
  dueDate: string;
  status: "reviewed" | "pending" | "overdue";
  rating: number | null;
  feedback: string | null;
  mentor: string;
  tasksCompleted: string[];
  challenges: string;
  nextWeekGoals: string[];
};

const initialReports: Report[] = [
  {
    id: 1,
    student: "Sophie Laurent",
    week: "Week 8",
    project: "Mobile App Redesign",
    submitted: true,
    submittedOn: "2024-02-19",
    dueDate: "2024-02-19",
    status: "reviewed",
    rating: 5,
    feedback:
      "Excellent progress on the UI components. Great attention to detail and user experience.",
    mentor: "Sarah Wilson",
    tasksCompleted: [
      "Completed user authentication flow",
      "Designed onboarding screens",
      "Implemented responsive navigation",
    ],
    challenges: "Minor issues with cross-platform compatibility",
    nextWeekGoals: ["Finalize payment integration", "Conduct user testing"],
  },
  {
    id: 2,
    student: "Pierre Martin",
    week: "Week 6",
    project: "Customer Analytics Dashboard",
    submitted: true,
    submittedOn: "2024-02-18",
    dueDate: "2024-02-19",
    status: "pending",
    rating: null,
    feedback: null,
    mentor: "Tom Davis",
    tasksCompleted: [
      "Set up data pipeline",
      "Created initial dashboard mockups",
      "Implemented basic filtering",
    ],
    challenges: "Performance optimization for large datasets",
    nextWeekGoals: [
      "Optimize query performance",
      "Add advanced visualizations",
    ],
  },
  {
    id: 3,
    student: "Marie Dubois",
    week: "Week 4",
    project: "E-commerce Platform",
    submitted: false,
    submittedOn: null,
    dueDate: "2024-02-20",
    status: "overdue",
    rating: null,
    feedback: null,
    mentor: "Alex Johnson",
    tasksCompleted: [],
    challenges: "",
    nextWeekGoals: [],
  },
  {
    id: 4,
    student: "Sophie Laurent",
    week: "Week 7",
    project: "Mobile App Redesign",
    submitted: true,
    submittedOn: "2024-02-12",
    dueDate: "2024-02-12",
    status: "reviewed",
    rating: 4,
    feedback:
      "Good progress on the design system. Consider improving accessibility features.",
    mentor: "Sarah Wilson",
    tasksCompleted: [
      "Created design system",
      "Implemented dark mode",
      "Updated color palette",
    ],
    challenges: "Ensuring consistency across different screen sizes",
    nextWeekGoals: [
      "Implement accessibility features",
      "Start user authentication",
    ],
  },
  {
    id: 5,
    student: "Jean Dupont",
    week: "Week 8",
    project: "AI Chatbot Integration",
    submitted: true,
    submittedOn: "2024-02-19",
    dueDate: "2024-02-19",
    status: "pending",
    rating: null,
    feedback: null,
    mentor: "Lisa Chen",
    tasksCompleted: [
      "Integrated NLP model",
      "Created conversation flow",
      "Tested with sample queries",
    ],
    challenges: "Handling ambiguous user inputs",
    nextWeekGoals: ["Improve context understanding", "Add sentiment analysis"],
  },
  {
    id: 6,
    student: "Emma Rousseau",
    week: "Week 5",
    project: "Marketing Analytics",
    submitted: false,
    submittedOn: null,
    dueDate: "2024-02-15",
    status: "overdue",
    rating: null,
    feedback: null,
    mentor: "Mike Johnson",
    tasksCompleted: [],
    challenges: "",
    nextWeekGoals: [],
  },
];

export default function CompanyReportsPage(): React.ReactElement {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    reportId: number | null;
  }>({ open: false, reportId: null });
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    reportId: number | null;
  }>({ open: false, reportId: null });
  const [feedbackValue, setFeedbackValue] = useState<string>("");
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null); // Track which report is expanded

  const pageSize = 3;

  // Filters
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "reviewed" | "overdue"
  >("all");
  const [weekFilter, setWeekFilter] = useState<"all" | "current" | "last" | "month">("all");

  // Export functionality
  const handleExportReports = (): void => {
    const exportData = filteredReports.map((report) => ({
      Student: report.student,
      Week: report.week,
      Project: report.project,
      Status: report.status,
      Submitted: report.submitted ? "Yes" : "No",
      "Submitted On": report.submittedOn || "N/A",
      "Due Date": report.dueDate,
      Rating: report.rating || "N/A",
      Feedback: report.feedback || "N/A",
      Mentor: report.mentor,
    }));
    const csvContent = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `weekly-reports-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send reminder functionality
  const handleSendReminder = (studentName: string, week: string): void => {
    alert(`Reminder sent to ${studentName} for ${week} report submission!`);
  };

  // Review and rate functionality
    // Review and rate functionality
  const handleReviewAndRate = (report: Report): void => {
    setRatingModal({ open: true, reportId: report.id });
    setRatingValue(0); // ← Reset to 0 so no stars are selected
    setFeedbackValue(report.feedback || "");
  };

  // Handle rating submission
  const handleRatingSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (ratingModal.reportId) {
      setReports((prevReports) =>
        prevReports.map((r) =>
          r.id === ratingModal.reportId
            ? { ...r, rating: ratingValue, feedback: feedbackValue, status: "reviewed" }
            : r
        )
      );
      setRatingModal({ open: false, reportId: null });
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (feedbackModal.reportId) {
      setReports((prevReports) =>
        prevReports.map((r) =>
          r.id === feedbackModal.reportId
            ? {
                ...r,
                feedback: feedbackValue,
                status: r.status === "pending" ? "reviewed" : r.status,
              }
            : r
        )
      );
      setFeedbackModal({ open: false, reportId: null });
    }
  };

  // Filtering logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchValue.trim() === "" ||
      report.student.toLowerCase().includes(searchValue.toLowerCase()) ||
      report.project.toLowerCase().includes(searchValue.toLowerCase()) ||
      report.week.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;

    const weekNumber = parseInt(report.week.replace("Week ", ""));
    const currentWeek = 8;
    const matchesWeek =
      weekFilter === "all" ||
      (weekFilter === "current" && weekNumber === currentWeek) ||
      (weekFilter === "last" && weekNumber === currentWeek - 1) ||
      (weekFilter === "month" && weekNumber >= currentWeek - 3 && weekNumber <= currentWeek);

    return matchesSearch && matchesStatus && matchesWeek;
  });

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  // Reset page on filter/search change
  const handleFilterChange =
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: T): void => {
      setter(value);
      setPage(1);
    };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    switch (status) {
      case "reviewed":
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case "reviewed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const pendingReports = reports.filter((report) => report.status === "pending");
  const overdueReports = reports.filter((report) => report.status === "overdue");

  const openFeedback = (report: Report): void => {
    setFeedbackModal({ open: true, reportId: report.id });
    setFeedbackValue(report.feedback || "");
  };

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
            <p className="text-gray-600">Review and evaluate intern progress reports</p>
          </div>
          <Button variant="outline" onClick={handleExportReports}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingReports.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueReports.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(
                      reports
                        .filter((r) => r.rating)
                        .reduce((sum, r) => sum + (r.rating || 0), 0) /
                      (reports.filter((r) => r.rating).length || 1)
                    ).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name, project, or week..."
                    className="pl-10"
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={weekFilter} onValueChange={handleFilterChange(setWeekFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="last">Last Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            paginatedReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.student} - {report.week}
                          </h3>
                          {getStatusBadge(report.status)}
                          {report.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {report.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Project:</strong> {report.project}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Mentor:</strong> {report.mentor}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Due Date:</strong> {report.dueDate}
                            </p>
                            {report.submittedOn && (
                              <p className="text-sm text-gray-600">
                                <strong>Submitted:</strong> {report.submittedOn}
                              </p>
                            )}
                          </div>
                          <div>
                            {report.submitted ? (
                              <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Not Submitted</Badge>
                            )}
                          </div>
                        </div>

                        {/* Show details only if this report is expanded */}
                        {expandedReportId === report.id && report.submitted && (
                          <>
                            <div className="mb-3">
                              <h4 className="font-semibold text-sm mb-2">Tasks Completed:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {report.tasksCompleted.map((task, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {report.challenges && (
                              <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-2">Challenges:</h4>
                                <p className="text-sm text-gray-600">{report.challenges}</p>
                              </div>
                            )}
                            {report.nextWeekGoals.length > 0 && (
                              <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-2">Next Week Goals:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {report.nextWeekGoals.map((goal, index) => (
                                    <li key={index} className="flex items-start">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                      {goal}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {report.feedback && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2 text-blue-900">Mentor Feedback:</h4>
                                <p className="text-sm text-blue-800">{report.feedback}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {report.submitted ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedReportId(expandedReportId === report.id ? null : report.id)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                          {report.status === "pending" && (
                            <Button size="sm" onClick={() => handleReviewAndRate(report)}>
                              Review & Rate
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleSendReminder(report.student, report.week)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Rating Modal */}
       {/* Rating Modal */}
<Dialog
  open={ratingModal.open}
  onOpenChange={(open) =>
    setRatingModal({
      open,
      reportId: open ? ratingModal.reportId : null,
    })
  }
>
  <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl">
    <DialogHeader>
      <DialogTitle>Review & Rate Report</DialogTitle>
    </DialogHeader>
    <form className="space-y-6" onSubmit={handleRatingSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rating (1-5 stars)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`h-8 w-8 transition-colors ${
                star <= ratingValue ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
              onClick={() => setRatingValue(star)}
            >
              <Star className="h-8 w-8" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Feedback
        </label>
        <textarea
          className="w-full border rounded p-2 min-h-[100px]"
          placeholder="Enter your feedback for this report..."
          value={feedbackValue}
          onChange={(e) => setFeedbackValue(e.target.value)}
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" disabled={ratingValue === 0}>
          Submit Review
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRatingModal({
              open: false,
              reportId: null,
            })
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

        {/* Report Evaluation Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Report Evaluation Guidelines</CardTitle>
            <CardDescription>Criteria for evaluating intern weekly reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Evaluation Criteria:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    â€¢ <strong>Task Completion (30%):</strong> Quality and quantity of completed work
                  </li>
                  <li>
                    â€¢ <strong>Problem Solving (25%):</strong> Approach to challenges and solutions
                  </li>
                  <li>
                    â€¢ <strong>Learning Progress (20%):</strong> Skill development and knowledge gain
                  </li>
                  <li>
                    â€¢ <strong>Communication (15%):</strong> Clarity and detail in reporting
                  </li>
                  <li>
                    â€¢ <strong>Initiative (10%):</strong> Proactive behavior and self-direction
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Rating Scale:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    â€¢ <strong>5 Stars:</strong> Exceptional performance, exceeds expectations
                  </li>
                  <li>
                    â€¢ <strong>4 Stars:</strong> Good performance, meets expectations well
                  </li>
                  <li>
                    â€¢ <strong>3 Stars:</strong> Satisfactory performance, meets basic expectations
                  </li>
                  <li>
                    â€¢ <strong>2 Stars:</strong> Below expectations, needs improvement
                  </li>
                  <li>
                    â€¢ <strong>1 Star:</strong> Poor performance, requires immediate attention
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}