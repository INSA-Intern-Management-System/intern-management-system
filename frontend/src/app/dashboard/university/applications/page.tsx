"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Plus, Upload } from "lucide-react";
import "../../../globals.css";
// import {Application,Applicant }  from "../../../../types/entities"

const initialApplications = [
  {
    id: 1,
    student: "Mike Johnson",
    email: "mike.johnson@student.insa.fr",
    company: "StartupXYZ",
    position: "UI/UX Designer",
    status: "pending",
    date: "2024-03-08",
  },
  {
    id: 2,
    student: "Jane Smith",
    email: "jane.smith@student.insa.fr",
    company: "Innovation Labs",
    position: "Data Analyst",
    status: "approved",
    date: "2024-03-09",
  },
  {
    id: 3,
    student: "Mike Johnson",
    email: "mike.johnson@student.insa.fr",
    company: "StartupXYZ",
    position: "UI/UX Designer",
    status: "pending",
    date: "2024-03-08",
  },
  {
    id: 4,
    student: "Sarah Wilson",
    email: "sarah.wilson@student.insa.fr",
    company: "Digital Agency",
    position: "Marketing Intern",
    status: "rejected",
    date: "2024-03-07",
  },
];

export default function UniversityApplicationsPage() {
  const [applications, setApplications] = useState(initialApplications);
  const [showNew, setShowNew] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newApp, setNewApp] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    institution: "",
    field_of_study: "",
    gender: "",
    duration: "",
    company: "",
    position: "",
    linkedin_url: "",
    github_url: "",
    cv_url: "",
    application_status: "pending",
  });
  const [page, setPage] = useState(1);

  const pageSize = 3;
  const totalPages = Math.ceil(applications.length / pageSize);
  const paginatedApplications = applications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleNewApp = (e: React.FormEvent) => {
    e.preventDefault();

    const studentFullName = `${newApp.first_name} ${newApp.last_name}`;

    setApplications([
      {
        // Unique ID for new application (auto-increment simulation)
        id: applications.length + 1,

        // Applicant full name as student
        student: studentFullName,

        // Applicant first and last names
        first_name: newApp.first_name,
        last_name: newApp.last_name,

        // Contact info
        email: newApp.email,
        phone_number: newApp.phone_number,

        // Education and study info
        institution: newApp.institution,
        field_of_study: newApp.field_of_study,
        gender: newApp.gender,
        duration: newApp.duration,
        company: newApp.company, // ✅ added
        position: newApp.position, // ✅ added

        // Optional URLs
        linkedin_url: newApp.linkedin_url,
        github_url: newApp.github_url,
        cv_url: newApp.cv_url,

        // Application status (default: pending)
        application_status: "pending",

        // Created and updated timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // Optional: you might want to add status and date fields consistent with initialApplications
        status: "pending",
        date: new Date().toISOString().slice(0, 10),
      },
      ...applications,
    ]);

    // Close the New Application dialog
    setShowNew(false);

    // Reset the newApp state to empty values matching schema fields
    setNewApp({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      institution: "  INSA Lyon",
      field_of_study: "",
      gender: "",
      duration: "",
      company: "INSA",
      position: "Student",
      linkedin_url: "",
      github_url: "",
      cv_url: "",
      application_status: "pending", // default status
    });

    setPage(1);
  };

  const handleBatchImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log("FileReader loaded", e);
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      console.log("Workbook Sheets:", workbook.SheetNames);

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      console.log("Worksheet:", worksheet);

      // Parse sheet to JSON with default values for missing cells (defval: "")
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });
      console.log("Parsed JSON Data:", jsonData);

      // Filter out empty rows (optional)
      const filteredData = jsonData.filter(
        (item) => item["First Name"] || item["Email"]
      );

      // Map Excel rows to your application format
      const importedApps = filteredData.map((item, index) => {
        const firstName = item["First Name"] || "";
        const lastName = item["Last Name"] || "";

        return {
          id: applications.length + index + 1,
          student: `${firstName} ${lastName}`.trim(),
          email: item["Email"] || "",
          company: item["Company"] || "INSA",
          position: item["Position"] || " Student",
          status: (item["Status"] || "pending").toLowerCase(),
         date: new Date().toISOString().slice(0, 10),

          // Extra fields if you want to keep them internally
          first_name: firstName,
          last_name: lastName,
          phone_number: item["Phone Number"] || "",
          institution: item["Institution"] || "",
          field_of_study: item["Field of Study"] || "",
          gender: item["Gender"] || "",
          duration: item["Duration"] || "",
          linkedin_url: item["LinkedIn URL"] || "",
          github_url: item["GitHub URL"] || "",
          cv_url: item["CV URL"] || "",
        };
      });

      console.log("Imported applications:", importedApps);

      // Update state by prepending imported apps to existing list
      setApplications((prev) => [...importedApps, ...prev]);
      setShowBatch(false);
      setSelectedFile(null);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs ">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">
            Pending
          </span>
        );
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6   ">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">
              Submit and manage internship applications for your students
            </p>
          </div>
          <div className="flex space-x-2 ">
            {/* New Application Dialog */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setShowNew(true)}
                  className="bg-black text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Application</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleNewApp}>
                  <Input
                    placeholder="First Name"
                    value={newApp.first_name}
                    onChange={(e) =>
                      setNewApp({ ...newApp, first_name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={newApp.last_name}
                    onChange={(e) =>
                      setNewApp({ ...newApp, last_name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newApp.email}
                    onChange={(e) =>
                      setNewApp({ ...newApp, email: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newApp.phone_number}
                    onChange={(e) =>
                      setNewApp({ ...newApp, phone_number: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Institution"
                    value={newApp.institution}
                    onChange={(e) =>
                      setNewApp({ ...newApp, institution: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Field of Study"
                    value={newApp.field_of_study}
                    onChange={(e) =>
                      setNewApp({ ...newApp, field_of_study: e.target.value })
                    }
                    required
                  />

                  <select
                    value={newApp.gender}
                    onChange={(e) =>
                      setNewApp({ ...newApp, gender: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black text-sm text-gray-500  placeholder-gray-400 h-10"
                  >
                    <option value="" disabled hidden className="text-gray-400">
                      Select Gender
                    </option>
                    <option value="Male" className="text-gray-900">
                      Male
                    </option>
                    <option value="Female" className="text-gray-900">
                      Female
                    </option>
                  </select>

                  <Input
                    placeholder="Duration (e.g. 3 months)"
                    value={newApp.duration}
                    onChange={(e) =>
                      setNewApp({ ...newApp, duration: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Company"
                    value={newApp.company}
                    onChange={(e) =>
                      setNewApp({ ...newApp, company: e.target.value })
                    }
                    required
                  />

                  <Input
                    placeholder="Position"
                    value={newApp.position}
                    onChange={(e) =>
                      setNewApp({ ...newApp, position: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={newApp.linkedin_url}
                    onChange={(e) =>
                      setNewApp({ ...newApp, linkedin_url: e.target.value })
                    }
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={newApp.github_url}
                    onChange={(e) =>
                      setNewApp({ ...newApp, github_url: e.target.value })
                    }
                  />
                  <Input
                    placeholder="CV URL"
                    value={newApp.cv_url}
                    onChange={(e) =>
                      setNewApp({ ...newApp, cv_url: e.target.value })
                    }
                  />
                  {/* Optional: hidden field for default status */}
                  <input
                    type="hidden"
                    value={newApp.application_status}
                    readOnly
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-black text-white"
                      onSubmit={handleNewApp}
                    >
                      Submit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNew(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Batch Import Dialog */}
            <Dialog open={showBatch} onOpenChange={setShowBatch}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setShowBatch(true)}>
                  <Upload className="h-4 w-4 mr-2 --input" />
                  Batch Import (Excel)
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <DialogHeader>
                  <DialogTitle>Batch Application Import</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 " onSubmit={handleBatchImport}>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    required
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex space-x-2 ">
                    <Button type="submit" className="bg-black text-white">
                      Import
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBatch(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Application List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications ({applications.length})</CardTitle>
            <CardDescription>
              List of all internship applications submitted by the university
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {app.student}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>
                        {app.company} • {app.position}
                      </span>
                      <span>Applied: {app.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
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
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </DashboardLayout>
  );
}
