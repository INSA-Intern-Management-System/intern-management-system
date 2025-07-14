"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { User, Search, Plus, MessageSquare, Calendar, Star, TrendingUp } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useRouter } from "next/navigation"

export default function CompanyInternsPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState<number | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState<number | null>(null);
  const interns = [
    {
      id: 1,
      name: "Sophie Laurent",
      position: "UI/UX Designer",
      mentor: "Sarah Wilson",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
      progress: 75,
      university: "INSA Rennes",
      project: "Mobile App Redesign",
      rating: 4.8,
      status: "active",
      skills: ["Figma", "Adobe XD", "HTML/CSS"],
      reportsSubmitted: 8,
      totalReports: 10,
    },
    {
      id: 2,
      name: "Pierre Martin",
      position: "Data Analyst",
      mentor: "Tom Davis",
      startDate: "2024-01-08",
      endDate: "2024-06-08",
      progress: 60,
      university: "INSA Toulouse",
      project: "Customer Analytics Dashboard",
      rating: 4.6,
      status: "active",
      skills: ["Python", "SQL", "Tableau"],
      reportsSubmitted: 6,
      totalReports: 10,
    },
    {
      id: 3,
      name: "Marie Dubois",
      position: "Software Developer",
      mentor: "Alex Johnson",
      startDate: "2024-02-01",
      endDate: "2024-07-01",
      progress: 45,
      university: "INSA Lyon",
      project: "E-commerce Platform",
      rating: 4.9,
      status: "active",
      skills: ["React", "Node.js", "MongoDB"],
      reportsSubmitted: 4,
      totalReports: 8,
    },
    {
      id: 4,
      name: "Lucas Bernard",
      position: "Software Developer",
      mentor: "Sarah Wilson",
      startDate: "2023-09-01",
      endDate: "2024-02-01",
      progress: 100,
      university: "INSA Lyon",
      project: "Internal Tools Development",
      rating: 4.7,
      status: "completed",
      skills: ["Java", "Spring", "MySQL"],
      reportsSubmitted: 20,
      totalReports: 20,
    },
  ]

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const universities = Array.from(new Set(interns.map(intern => intern.university)));
  const filteredInterns = interns.filter(intern =>
    (statusFilter === 'all' || intern.status === statusFilter) &&
    (universityFilter === 'all' || intern.university === universityFilter)
  );
  const totalPages = Math.ceil(filteredInterns.length / pageSize);
  const paginatedInterns = filteredInterns.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "on-leave":
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const activeInterns = interns.filter((intern) => intern.status === "active")

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
            <p className="text-gray-600">Manage and track your intern team</p>
          </div>
          {/* Removed Add Intern button */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Interns</p>
                  <p className="text-2xl font-bold">{interns.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Interns</p>
                  <p className="text-2xl font-bold text-green-600">{activeInterns.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(interns.reduce((sum, intern) => sum + intern.rating, 0) / interns.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(activeInterns.reduce((sum, intern) => sum + intern.progress, 0) / activeInterns.length)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search interns by name, position, or project..." className="pl-10 rounded-md bg-white border border-gray-200" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-48 border-0 bg-gray-100 text-gray-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="w-48 border-0 bg-white text-gray-600 ">
                  <SelectItem className="hover:bg-gray-100" value="all">All Statuses</SelectItem>
                  <SelectItem className="hover:bg-gray-100" value="active">Active</SelectItem>
                  <SelectItem className="hover:bg-gray-100" value="completed">Completed</SelectItem>
                  <SelectItem className="hover:bg-gray-100" value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <Select value={universityFilter} onValueChange={value => { setUniversityFilter(value); setPage(1); }}>
                <SelectTrigger className="w-48 border-0 bg-gray-100 text-gray-600">
                  <SelectValue placeholder="Filter by university" />
                </SelectTrigger>
                <SelectContent className="w-48 border-0 bg-white text-gray-600 ">
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities.map(u => (
                    <SelectItem className="hover:bg-gray-100" key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Interns List */}
        <div className="space-y-4">
          {paginatedInterns.map((intern) => (
            <Card key={intern.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{intern.name}</h3>
                        {getStatusBadge(intern.status)}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{intern.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Position:</span> {intern.position}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">University:</span> {intern.university}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Mentor:</span> {intern.mentor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Project:</span> {intern.project}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Start Date:</span> {intern.startDate}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">End Date:</span> {intern.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Reports:</span> {intern.reportsSubmitted}/{intern.totalReports}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Progress:</span> {intern.progress}%</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Skills:</span>
                        <span className="ml-2 space-x-2">
                          {intern.skills.map(skill => (
                            <span key={skill} className="inline-block bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-xs font-medium mr-2 mb-1">{skill}</span>
                          ))}
                        </span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-2">Progress</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-blue-600" style={{ width: `${intern.progress}%` }}></div>
                        </div>
                        <span className="ml-2 text-sm font-semibold text-gray-800">{intern.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 min-w-[120px] items-end">
                    {/* View Profile Dialog */}
                    <Dialog open={profileOpen === intern.id} onOpenChange={open => setProfileOpen(open ? intern.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">View Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold mb-2">{intern.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-start space-x-6">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                            {intern.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(intern.status)}
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">{intern.rating}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                              <div>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Position:</span> {intern.position}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">University:</span> {intern.university}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Mentor:</span> {intern.mentor}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Project:</span> {intern.project}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Start Date:</span> {intern.startDate}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">End Date:</span> {intern.endDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Reports:</span> {intern.reportsSubmitted}/{intern.totalReports}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Progress:</span> {intern.progress}%</p>
                              </div>
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold text-gray-700">Skills:</span>
                              <span className="ml-2 space-x-2">
                                {intern.skills.map(skill => (
                                  <span key={skill} className="inline-block bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-xs font-medium mr-2 mb-1">{skill}</span>
                                ))}
                              </span>
                            </div>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-gray-600 mr-2">Progress</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-blue-600" style={{ width: `${intern.progress}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm font-semibold text-gray-800">{intern.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Message Redirect */}
                    <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/company/messages')}>Message</Button>
                    {/* Schedule Dialog */}
                    <Dialog open={scheduleOpen === intern.id} onOpenChange={open => setScheduleOpen(open ? intern.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">Schedule</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold mb-2">Schedule Meeting</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" className="w-full border border-gray-200 rounded px-2 py-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input type="time" className="w-full border border-gray-200 rounded px-2 py-1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="w-full border border-gray-200 rounded px-2 py-1" rows={2} placeholder="Meeting agenda or notes..." />
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" className="bg-black text-white hover:bg-gray-900">Schedule</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
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

        {/* Intern Management Best Practices */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6">
          <CardHeader>
            <CardTitle>Intern Management Best Practices</CardTitle>
            <CardDescription>Tips for building and managing effective intern teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Intern Onboarding:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Provide a clear onboarding process and resources</li>
                  <li>• Assign mentors for guidance and support</li>
                  <li>• Set clear goals and expectations</li>
                  <li>• Foster a welcoming and inclusive environment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Ongoing Management:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Hold regular check-ins and feedback sessions</li>
                  <li>• Encourage skill development and learning</li>
                  <li>• Recognize achievements and progress</li>
                  <li>• Support career growth and networking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
