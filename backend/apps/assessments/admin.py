from django.contrib import admin
from .models import MCQQuestion, MCQAnswer, GlobalMCQQuestion, SessionQuestion


class GlobalMCQQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question_text_short', 'correct_answer', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('question_text', 'option_a', 'option_b', 'option_c', 'option_d')
    list_editable = ('is_active',)
    
    def question_text_short(self, obj):
        return obj.question_text[:60] + "..." if len(obj.question_text) > 60 else obj.question_text
    question_text_short.short_description = 'Question'


class SessionQuestionAdmin(admin.ModelAdmin):
    list_display = ('session', 'question_id', 'question_preview', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session__id', 'question__question_text')
    
    def question_id(self, obj):
        return obj.question.id
    question_id.short_description = 'Q ID'
    
    def question_preview(self, obj):
        return obj.question.question_text[:50] + "..."
    question_preview.short_description = 'Question'


class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ('session', 'question_text', 'correct_answer', 'created_at')
    list_filter = ('session', 'created_at')
    search_fields = ('question_text', 'option_a', 'option_b', 'option_c', 'option_d')

class MCQAnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'session', 'selected_answer', 'is_correct', 'answered_at')
    list_filter = ('is_correct', 'answered_at')
    search_fields = ('question__question_text',)

admin.site.register(GlobalMCQQuestion, GlobalMCQQuestionAdmin)
admin.site.register(SessionQuestion, SessionQuestionAdmin)
admin.site.register(MCQQuestion, MCQQuestionAdmin)
admin.site.register(MCQAnswer, MCQAnswerAdmin)
