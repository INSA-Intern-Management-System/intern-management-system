"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Building2, Search, Plus, Eye } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function PlanTasksPage() {
  // Mock data for plans & tasks
  const initialPlans = [
    { id: 1, title: "Complete Week 3 Report", description: "Finish and submit the week 3 report for your internship.", due: "2024-06-10", status: "pending" },
    { id: 2, title: "Mentor Meeting", description: "Attend the scheduled meeting with your mentor.", due: "2024-06-12", status: "upcoming" },
    { id: 3, title: "Monthly Evaluation", description: "Prepare for the monthly evaluation with your supervisor.", due: "2024-06-15", status: "upcoming" },
    { id: 4, title: "Update Resume", description: "Revise and update your resume for future applications.", due: "2024-06-18", status: "pending" },
    { id: 5, title: "Project Demo", description: "Present your project demo to the team.", due: "2024-06-20", status: "upcoming" },
    { id: 6, title: "Submit Feedback", description: "Provide feedback on the internship experience.", due: "2024-06-22", status: "pending" },
  ];
  const [plans, setPlans] = useState(initialPlans);
  const [newPlan, setNewPlan] = useState({ title: "", description: "", due: "" });
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(plans.length / pageSize);
  const paginatedPlans = plans.slice((page - 1) * pageSize, page * pageSize);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title || !newPlan.description || !newPlan.due) return;
    setPlans([
      { id: plans.length + 1, ...newPlan, status: "pending" },
      ...plans,
    ]);
    setNewPlan({ title: "", description: "", due: "" });
    setShowForm(false);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan & Tasks</h1>
            <p className="text-gray-600">Organize and track your plans and tasks</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Plan & Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
              <div>
                <h2 className="text-xl font-semibold mb-4">Create New Plan & Task</h2>
                <form className="space-y-4" onSubmit={e => { handleCreatePlan(e); setDialogOpen(false); }}>
                  <Input
                    placeholder="Title"
                    value={newPlan.title}
                    onChange={e => setNewPlan({ ...newPlan, title: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Due Date (YYYY-MM-DD)"
                    type="date"
                    value={newPlan.due}
                    onChange={e => setNewPlan({ ...newPlan, due: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={newPlan.description}
                    onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
                    required
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button type="submit" className="bg-black text-white hover:bg-gray-900 px-6">Create</Button>
                    <Button type="button" variant="outline" className="border-black text-black px-6" onClick={() => { setDialogOpen(false); setNewPlan({ title: "", description: "", due: "" }); }}>Cancel</Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans & Tasks List */}
        <div className="space-y-4">
          {paginatedPlans.map((plan) => (
            <Card key={plan.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>📅 Due: {plan.due}</span>
                    </div>
                  </div>
                  <Badge className={plan.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={e => { e.preventDefault(); setPage(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        {/* Plan & Tasks Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Plan & Tasks Guidelines</CardTitle>
            <CardDescription>What to include in your plans and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Sections:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Clear task objectives</li>
                  <li>• Deadlines and milestones</li>
                  <li>• Resources or support needed</li>
                  <li>• Expected outcomes</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Tips for Success:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Break down large goals into smaller tasks</li>
                  <li>• Set realistic deadlines</li>
                  <li>• Review and update your plans regularly</li>
                  <li>• Communicate with your mentor or supervisor</li>
                  <li>• Reflect on completed tasks for improvement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
