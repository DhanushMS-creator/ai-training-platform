from django.contrib import admin
from .models import MCQQuestion, MCQAnswer

class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ('session', 'question_text', 'correct_answer', 'created_at')
    list_filter = ('session', 'created_at')
    search_fields = ('question_text', 'option_a', 'option_b', 'option_c', 'option_d')

class MCQAnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'session', 'selected_answer', 'is_correct', 'answered_at')
    list_filter = ('is_correct', 'answered_at')
    search_fields = ('question__question_text',)

admin.site.register(MCQQuestion, MCQQuestionAdmin)
admin.site.register(MCQAnswer, MCQAnswerAdmin)