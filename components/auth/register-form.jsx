"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "./auth-provider"

export function RegisterForm({ onSuccess }) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    userType: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    // Patient specific
    gender: "",
    dob: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    allergies: "",
    // Doctor specific
    designation: "",
    specialization: "",
    deptId: "",
    // Staff specific
    role: "",
    shift: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Prepare data based on user type
    const submitData = {
      userType: formData.userType,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    }

    if (formData.userType === "patient") {
      submitData.gender = formData.gender
      submitData.dob = formData.dob
      submitData.address = formData.address
      submitData.emergencyContact = formData.emergencyContact || formData.phone
      submitData.bloodGroup = formData.bloodGroup
      submitData.allergies = formData.allergies ? formData.allergies.split(",").map((a) => a.trim()) : []
    } else if (formData.userType === "doctor") {
      submitData.designation = formData.designation
      submitData.specialization = formData.specialization
      submitData.deptId = formData.deptId
    } else if (formData.userType === "staff") {
      submitData.role = formData.role
      submitData.shift = formData.shift
      submitData.deptId = formData.deptId
    }

    const result = await register(submitData)

    if (result.success) {
      setSuccess("Registration successful! You can now login with your credentials.")
      setFormData({
        userType: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        dob: "",
        address: "",
        emergencyContact: "",
        bloodGroup: "",
        allergies: "",
        designation: "",
        specialization: "",
        deptId: "",
        role: "",
        shift: "",
      })
      if (onSuccess) onSuccess()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Account</CardTitle>
        <CardDescription>Register as a new user in the Arogya Hospital system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="staff">Staff Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Patient Specific Fields */}
          {formData.userType === "patient" && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </div>
              </div>
            </>
          )}

          {/* Doctor Specific Fields */}
          {formData.userType === "doctor" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  placeholder="e.g., Senior Consultant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => handleInputChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Gynecology">Gynecology</SelectItem>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Staff Specific Fields */}
          {formData.userType === "staff" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                    <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="Ambulance Driver">Ambulance Driver</SelectItem>
                    <SelectItem value="Ward Boy">Ward Boy</SelectItem>
                    <SelectItem value="Cleaner">Cleaner</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select value={formData.shift} onValueChange={(value) => handleInputChange("shift", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="Evening">Evening (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {error && <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">{error}</div>}

          {success && <div className="text-secondary text-sm bg-secondary/10 p-2 rounded">{success}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
