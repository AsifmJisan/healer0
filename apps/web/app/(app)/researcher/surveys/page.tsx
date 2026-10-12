"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { fetchResearchSurveys, ResearchSurvey } from "@/lib/api/research";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PsychometricSurveysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSurveyId, setExpandedSurveyId] = useState<string | null>(null);

  const { data: surveys, isLoading, isError, error } = useQuery({
    queryKey: ["research", "surveys"],
    queryFn: fetchResearchSurveys,
  });

  const surveyList: ResearchSurvey[] = Array.isArray(surveys)
    ? surveys
    : Array.isArray((surveys as any)?.surveys)
    ? (surveys as any).surveys
    : [];

  const filteredSurveys = surveyList.filter((s) => {
    return (
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.project?.title && s.project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedSurveyId(expandedSurveyId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Psychometric Scales
            </span>
            <span className="text-zinc-400 text-xs">Standardized Assessment Batteries</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-2">
            Surveys & Psychometric Instruments
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Author and deploy standardized clinical assessments (GAD-7, PHQ-9, PANAS) and study-specific questionnaire batteries.
          </p>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search instruments or scales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-white"
          />
        </div>
      </div>

      {/* Survey Cards */}
      {isLoading ? (
        <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200/80 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading psychometric instruments from database...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          Failed to load surveys: {(error as Error)?.message}
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200/80 rounded-xl">
          <ClipboardList className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900">No Instruments Found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? "No surveys match your current search term." : "No instruments configured yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSurveys.map((survey: ResearchSurvey) => {
            const isExpanded = expandedSurveyId === survey.id;
            return (
              <Card
                key={survey.id}
                className="bg-white border-zinc-200/80 transition-all p-5 shadow-2xs hover:shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                        {survey.questionCount || (survey.questions?.length || 0)} Questions
                      </span>
                      {survey.project?.title && (
                        <span className="text-xs font-medium text-zinc-500">
                          Study: {survey.project.title}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">
                      {survey.title}
                    </h3>

                    {survey.description && (
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {survey.description}
                      </p>
                    )}
                  </div>

                  {survey.questions && survey.questions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(survey.id)}
                      className="text-xs shrink-0 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Battery Items <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        </>
                      ) : (
                        <>
                          View Battery Items ({survey.questions.length}) <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Expanded Questions Battery */}
                {isExpanded && survey.questions && survey.questions.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Standardized Question Items
                    </h4>
                    <div className="space-y-2">
                      {survey.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-800">
                              Item {idx + 1}: {q.questionText}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase bg-white px-2 py-0.5 rounded border">
                              {q.questionType}
                            </span>
                          </div>
                          {q.options && Array.isArray(q.options) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {q.options.map((opt: string, optIdx: number) => (
                                <span
                                  key={optIdx}
                                  className="px-2 py-0.5 rounded text-[10px] bg-white border border-zinc-200 text-zinc-600"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
