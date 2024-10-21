import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  BookOpen,
  BarChart,
  Pause,
  PlayCircle,
  RotateCcw,
  Link,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StudyDashboard = () => {
  const [timer, setTimer] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [reportType, setReportType] = useState("day");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionLinks, setSessionLinks] = useState("");
  const [sessionFootnote, setSessionFootnote] = useState("");
  const [sessionImages, setSessionImages] = useState("");
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  useEffect(() => {
    const storedSubjects = JSON.parse(localStorage.getItem("subjects")) || [];
    const storedSessions =
      JSON.parse(localStorage.getItem("studySessions")) || [];
    setSubjects(storedSubjects);
    setStudySessions(storedSessions);
  }, []);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("studySessions", JSON.stringify(studySessions));
  }, [studySessions]);

  const addSubject = () => {
    if (currentSubject && !subjects.includes(currentSubject)) {
      setSubjects([...subjects, currentSubject]);
      setCurrentSubject("");
    }
  };

  const startTimer = () => {
    if (!currentSubject) return;
    setIsTimerRunning(true);
    startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      elapsedTimeRef.current = elapsedSeconds;
      setTimer(25 * 60 - elapsedSeconds);
      if (elapsedSeconds >= 25 * 60) {
        pauseTimer();
      }
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsTimerRunning(false);
    setTimer(25 * 60);
    elapsedTimeRef.current = 0;
  };

  const stopTimer = () => {
    if (elapsedTimeRef.current > 0) {
      setStudySessions([
        ...studySessions,
        {
          subject: currentSubject,
          duration: elapsedTimeRef.current,
          date: new Date(startTimeRef.current),
          notes: sessionNotes,
          links: sessionLinks,
          footnote: sessionFootnote,
          images: sessionImages
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url),
        },
      ]);
    }
    resetTimer();
    setSessionNotes("");
    setSessionLinks("");
    setSessionFootnote("");
    setSessionImages("");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const generateReport = () => {
    const now = new Date();
    const filteredSessions = studySessions.filter((session) => {
      const sessionDate = new Date(session.date);
      switch (reportType) {
        case "day":
          return sessionDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case "month":
          return (
            sessionDate.getMonth() === now.getMonth() &&
            sessionDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    });

    const reportData = subjects.map((subject) => {
      const totalTime = filteredSessions
        .filter((session) => session.subject === subject)
        .reduce((sum, session) => sum + session.duration, 0);
      return { subject, totalTime: Math.round(totalTime / 60) }; // Convert to minutes
    });

    return reportData;
  };

  const reportData = generateReport();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Study Tracking Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" /> Study Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentSubject} onValueChange={setCurrentSubject}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex mb-2">
              <Input
                type="text"
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="Add a new subject"
                className="mr-2"
              />
              <Button onClick={addSubject}>Add</Button>
            </div>
            <div className="text-4xl font-bold mb-4">{formatTime(timer)}</div>
            <div className="flex space-x-2 mb-4">
              <Button onClick={isTimerRunning ? pauseTimer : startTimer} disabled={!currentSubject}>
                {isTimerRunning ? <Pause className="mr-2" /> : <PlayCircle className="mr-2" />}
                {isTimerRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetTimer}>
                <RotateCcw className="mr-2" /> Reset
              </Button>
              <Button onClick={stopTimer}>End</Button>
            </div>
            <Textarea
              placeholder="Add notes for this session"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Add links (comma-separated)"
              value={sessionLinks}
              onChange={(e) => setSessionLinks(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Add a footnote"
              value={sessionFootnote}
              onChange={(e) => setSessionFootnote(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Add image URLs (comma-separated)"
              value={sessionImages}
              onChange={(e) => setSessionImages(e.target.value)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2" /> Study Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalTime"
                  stroke="#8884d8"
                  name="Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" /> Study Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studySessions.map((session, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mb-2 w-full text-left justify-start"
                >
                  {new Date(session.date).toLocaleString()} - {session.subject}{" "}
                  ({Math.round(session.duration / 60)} minutes)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    {session.subject} -{" "}
                    {new Date(session.date).toLocaleString()}
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {Math.round(session.duration / 60)} minutes
                  </p>
                  <p>
                    <strong>Notes:</strong> {session.notes || "No notes added"}
                  </p>
                  <p>
                    <strong>Links:</strong> {session.links.split(",").map(link => <a href={link} target="_blank" rel="noopener noreferrer">{link}</a> ) || "No links added"}
                  </p>
                  <p>
                    <strong>Footnote:</strong>{" "}
                    {session.footnote || "No footnote added"}
                  </p>
                  {session.images && session.images.length > 0 && (
                    <div>
                      <p>
                        <strong>Images:</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {session.images.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Study session image ${i + 1}`}
                            className="max-w-full h-auto"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyDashboard;
