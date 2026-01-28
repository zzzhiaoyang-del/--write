"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Send, Loader2, Check } from "lucide-react"
import type { FormStep, FormField } from "@/lib/agents-data"
import { cn } from "@/lib/utils"

interface AgentFormProps {
  steps: FormStep[]
  onSubmit: (data: Record<string, string | string[]>) => void
  isGenerating: boolean
}

export function AgentForm({ steps, onSubmit, isGenerating }: AgentFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const updateField = (fieldId: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleCheckboxChange = (fieldId: string, optionValue: string, checked: boolean) => {
    const currentValues = (formData[fieldId] as string[]) || []
    if (checked) {
      updateField(fieldId, [...currentValues, optionValue])
    } else {
      updateField(fieldId, currentValues.filter((v) => v !== optionValue))
    }
  }

  const isStepValid = () => {
    const requiredFields = currentStepData.fields.filter((f) => f.required)
    return requiredFields.every((field) => {
      const value = formData[field.id]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && value.toString().trim() !== ""
    })
  }

  const handleNext = () => {
    if (isLastStep) {
      onSubmit(formData)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="bg-background"
          />
        )
      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="min-h-24 resize-none bg-background"
          />
        )
      case "select":
        return (
          <Select
            value={(formData[field.id] as string) || ""}
            onValueChange={(value) => updateField(field.id, value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup
            value={(formData[field.id] as string) || ""}
            onValueChange={(value) => updateField(field.id, value)}
            className="grid grid-cols-2 gap-3"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        const selectedValues = (formData[field.id] as string[]) || []
        return (
          <div className="grid grid-cols-2 gap-3">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(field.id, option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm hidden sm:inline",
                    index === currentStep
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-4",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
        {currentStepData.description && (
          <CardDescription>{currentStepData.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {currentStepData.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            {renderField(field)}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isGenerating}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isGenerating}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : isLastStep ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                一键生成
              </>
            ) : (
              <>
                下一步
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
