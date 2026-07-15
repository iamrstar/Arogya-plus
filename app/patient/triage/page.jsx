"use client"

import { useState } from "react"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Send, Activity, ShieldAlert, ArrowRight, Bot, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AITriage() {
  const [symptoms, setSymptoms] = useState("")
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello. I am the Arogya AI Triage Assistant. Please describe your symptoms in detail, including when they started and their severity." }
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return

    const userMessage = { role: "user", text: symptoms }
    setMessages(prev => [...prev, userMessage])
    setSymptoms("")
    setIsAnalyzing(true)

    // Mock AI Processing Time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simple keyword-based mock logic
    const text = userMessage.text.toLowerCase()
    let result = {
      department: "General Medicine",
      urgency: "Routine",
      score: 45,
      recommendation: "Please consult a general physician for a routine checkup.",
      color: "bg-blue-500",
      alert: false
    }

    if (text.includes("chest") || text.includes("heart") || text.includes("breath")) {
      result = {
        department: "Cardiology",
        urgency: "Critical",
        score: 92,
        recommendation: "High risk indicators detected. Please proceed to emergency or book an immediate cardiology consultation.",
        color: "bg-red-600",
        alert: true
      }
    } else if (text.includes("headache") || text.includes("dizzy") || text.includes("numb")) {
      result = {
        department: "Neurology",
        urgency: "Urgent",
        score: 75,
        recommendation: "Neurological symptoms detected. An urgent consultation is recommended.",
        color: "bg-orange-500",
        alert: false
      }
    } else if (text.includes("bone") || text.includes("pain") || text.includes("fall")) {
      result = {
        department: "Orthopedics",
        urgency: "Moderate",
        score: 60,
        recommendation: "Possible musculoskeletal issue. Schedule an orthopedic evaluation.",
        color: "bg-amber-500",
        alert: false
      }
    }

    const aiMessage = { role: "assistant", text: "I have analyzed your symptoms. See the diagnostic report below." }
    setMessages(prev => [...prev, aiMessage])
    setAnalysisResult(result)
    setIsAnalyzing(false)
  }

  return (
    <PatientLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            AI Triage <Brain className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-slate-500 font-medium mt-2">Intelligent symptom analysis and department routing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <Card className="rounded-[2rem] border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Arogya AI</h3>
                <p className="text-xs text-slate-400">Diagnostic Engine v2.0</p>
              </div>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 shadow-sm rounded-tl-sm text-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-slate-600 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm p-4 flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <Textarea 
                  placeholder="Describe your symptoms (e.g., 'I have severe chest pain and shortness of breath')..."
                  className="resize-none rounded-xl pr-14 bg-slate-50 border-slate-200 h-20"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAnalyze()
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  className="absolute right-2 bottom-2 rounded-lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !symptoms.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Analysis Report */}
          <div className="space-y-6">
            {analysisResult ? (
              <Card className={`rounded-[2rem] border-none shadow-xl overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-right-8`}>
                <div className={`${analysisResult.color} p-6 text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                      AI Diagnostic Report
                    </Badge>
                    {analysisResult.alert && <ShieldAlert className="w-6 h-6 animate-pulse" />}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight mb-1">{analysisResult.department}</h3>
                  <p className="opacity-90 font-medium text-sm">Recommended Speciality</p>
                </div>
                
                <CardContent className="p-8 space-y-8 bg-white">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Risk Score</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900 leading-none">{analysisResult.score}</span>
                        <span className="text-sm font-bold text-slate-400 pb-1">/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Urgency</p>
                      <Badge className={`${analysisResult.color} text-white`}>{analysisResult.urgency}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Clinical Recommendation</p>
                    <p className="text-slate-700 font-medium leading-relaxed">{analysisResult.recommendation}</p>
                  </div>

                  <Button className="w-full h-14 rounded-xl text-lg font-bold gap-2">
                    Book {analysisResult.department} Consultation <ArrowRight className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 text-primary opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Awaiting Symptoms</h3>
                <p className="text-slate-500 max-w-xs">Describe how you're feeling in the chat to generate an AI-powered triage report and department recommendation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}
