"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Plus } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

export default function SchedulesPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: "Department Meeting",
      date: "2024-06-10",
      time: "10:00 AM",
      location: "Room 201",
      description: "Monthly department meeting for all supervisors."
    },
    {
      id: 2,
      title: "Evaluation Deadline",
      date: "2024-06-15",
      time: "11:59 PM",
      location: "Online Portal",
      description: "Final evaluation submission deadline."
    },
    {
      id: 3,
      title: "Internship Orientation",
      date: "2024-06-20",
      time: "2:00 PM",
      location: "Auditorium",
      description: "Orientation for new interns and supervisors."
    },
  ])
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: ""
  })
  const [page, setPage] = useState(1)
  const pageSize = 3
  const totalPages = Math.ceil(schedules.length / pageSize)
  const paginatedSchedules = schedules.slice((page - 1) * pageSize, page * pageSize)

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    setSchedules([
      { id: schedules.length + 1, ...newSchedule },
      ...schedules,
    ])
    setShowDialog(false)
    setNewSchedule({ title: "", date: "", time: "", location: "", description: "" })
  }

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
            <p className="text-gray-600">View and manage important schedules and events</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Schedule</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateSchedule}>
                <Input
                  placeholder="Title"
                  value={newSchedule.title}
                  onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  required
                />
                <Input
                  type="date"
                  placeholder="Date"
                  value={newSchedule.date}
                  onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  placeholder="Time"
                  value={newSchedule.time}
                  onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  required
                />
                <Input
                  placeholder="Location"
                  value={newSchedule.location}
                  onChange={e => setNewSchedule({ ...newSchedule, location: e.target.value })}
                  required
                />
                <Input
                  placeholder="Description"
                  value={newSchedule.description}
                  onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedules List */}
        <div className="space-y-4">
          {paginatedSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{schedule.title}</CardTitle>
                    <CardDescription>{schedule.date} • {schedule.time} • {schedule.location}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{schedule.description}</p>
              </CardContent>
            </Card>
          ))}
          {schedules.length === 0 && (
            <div className="text-center text-gray-500 py-8">No schedules available.</div>
          )}
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
      </div>
    </DashboardLayout>
  )
} 