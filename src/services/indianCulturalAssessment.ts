import { AssessmentQuestion, ConversationalAssessmentEngine, SimpleUserProfile } from './assessmentEngine';

export interface IndianCulturalStressor {
  category: 'academic' | 'family' | 'career' | 'marriage' | 'social' | 'financial' | 'identity';
  severity: 'low' | 'moderate' | 'high' | 'severe';
  description: string;
  culturalContext: string[];
  interventionPriority: number;
}

export interface CulturalPressureAssessment {
  academicPressure: number;
  familyExpectations: number;
  careerAnxiety: number;
  marriageStress: number;
  socialComparison: number;
  financialWorries: number;
  identityConflict: number;
  overallCulturalStress: number;
}

export class IndianCulturalAssessmentEngine extends ConversationalAssessmentEngine {
  private culturalStressors: Map<string, IndianCulturalStressor[]>;

  constructor() {
    super();
    this.culturalStressors = new Map();
    this.initializeCulturalStressors();
  }

  private initializeCulturalStressors(): void {
    // Academic Pressure Stressors
    const academicStressors: IndianCulturalStressor[] = [
      {
        category: 'academic',
        severity: 'high',
        description: 'Pressure to excel in competitive exams (JEE, NEET, UPSC)',
        culturalContext: ['merit-based society', 'limited seats', 'family pride'],
        interventionPriority: 9
      },
      {
        category: 'academic',
        severity: 'moderate',
        description: 'Comparison with high-achieving peers and cousins',
        culturalContext: ['extended family dynamics', 'social status'],
        interventionPriority: 7
      },
      {
        category: 'academic',
        severity: 'high',
        description: 'Fear of disappointing parents who sacrificed for education',
        culturalContext: ['parental sacrifice', 'intergenerational mobility'],
        interventionPriority: 8
      }
    ];

    // Family Expectation Stressors
    const familyStressors: IndianCulturalStressor[] = [
      {
        category: 'family',
        severity: 'high',
        description: 'Pressure to maintain family honor and reputation',
        culturalContext: ['family izzat', 'community standing'],
        interventionPriority: 8
      },
      {
        category: 'family',
        severity: 'moderate',
        description: 'Balancing individual desires with family expectations',
        culturalContext: ['collectivist culture', 'duty vs. personal choice'],
        interventionPriority: 7
      },
      {
        category: 'family',
        severity: 'high',
        description: 'Managing joint family dynamics and multiple authority figures',
        culturalContext: ['joint family system', 'hierarchical relationships'],
        interventionPriority: 6
      }
    ];

    // Career and Financial Stressors
    const careerStressors: IndianCulturalStressor[] = [
      {
        category: 'career',
        severity: 'high',
        description: 'Pressure to pursue "stable" careers (engineering, medicine, government)',
        culturalContext: ['job security priority', 'social prestige'],
        interventionPriority: 8
      },
      {
        category: 'financial',
        severity: 'moderate',
        description: 'Expectation to financially support parents and extended family',
        culturalContext: ['filial duty', 'economic responsibility'],
        interventionPriority: 7
      }
    ];

    this.culturalStressors.set('academic', academicStressors);
    this.culturalStressors.set('family', familyStressors);
    this.culturalStressors.set('career', careerStressors);
  }

  async conductIndianStressAssessment(userProfile: SimpleUserProfile): Promise<CulturalPressureAssessment> {
    const questions = this.generateIndianSpecificQuestions(userProfile);
    const responses = await this.conductConversationalAssessment(questions, userProfile);

    return this.analyzeCulturalPressures(responses, userProfile);
  }

  private generateIndianSpecificQuestions(userProfile: SimpleUserProfile): AssessmentQuestion[] {
    const baseQuestions: AssessmentQuestion[] = [
      {
        id: 'academic_pressure_1',
        type: 'conversational',
        originalText: 'Academic performance and competitive exam stress',
        conversationalPrompt: 'Let\'s talk about your academic journey. How are you feeling about your studies and any competitive exams you might be preparing for or thinking about?',
        culturalAdaptations: {
          'student': 'I know the pressure around exams like JEE, NEET, or board exams can be intense. How are you managing with your preparation and the expectations around you?',
          'graduate': 'Whether it\'s job interviews, higher studies, or competitive exams like UPSC, there\'s often a lot of pressure. How are you handling these challenges?',
          'hindi': 'पढ़ाई और प्रतियोगी परीक्षाओं का दबाव कैसा लग रहा है? आप इसे कैसे संभाल रहे हैं?'
        },
        followUpQuestions: [
          'What specific aspects of academic pressure worry you most?',
          'How do your family members react when you discuss your academic concerns?',
          'What would happen if you didn\'t meet the academic expectations set for you?'
        ],
        scoringWeight: 2,
        category: 'academic_pressure'
      },
      {
        id: 'family_expectations_1',
        type: 'conversational',
        originalText: 'Family expectations and decision-making autonomy',
        conversationalPrompt: 'Family is so central to our lives. I\'m curious about how you navigate your own goals and dreams alongside your family\'s expectations for you.',
        culturalAdaptations: {
          'joint_family': 'Living in a joint family means many people care about your choices. How do you balance everyone\'s opinions with what you want for yourself?',
          'nuclear_family': 'Even in smaller families, there can be strong expectations. How do you handle the balance between making your parents proud and following your own path?',
          'hindi': 'परिवार की अपेक्षाएं और आपके अपने सपने - इन दोनों के बीच आप कैसे संतुलन बनाते हैं?'
        },
        followUpQuestions: [
          'Can you tell me about a time when your goals differed from your family\'s expectations?',
          'How much say do you feel you have in major life decisions?',
          'What fears do you have about disappointing your family?'
        ],
        scoringWeight: 2,
        category: 'family_expectations'
      },
      {
        id: 'career_anxiety_1',
        type: 'conversational',
        originalText: 'Career path and job security concerns',
        conversationalPrompt: 'Career choices can feel overwhelming, especially with so many opinions about what\'s "safe" or "prestigious." How are you feeling about your career path and future job prospects?',
        culturalAdaptations: {
          'engineering_student': 'I know there\'s often pressure to get into top companies or pursue higher studies. How are you feeling about your engineering career prospects?',
          'medical_student': 'The medical field has its own unique pressures and expectations. How are you managing the stress around your medical career?',
          'arts_student': 'Choosing arts or humanities can sometimes come with extra pressure to justify your choice. How are you handling this?',
          'hindi': 'करियर को लेकर चिंता और नौकरी की सुरक्षा के बारे में आप कैसा महसूस करते हैं?'
        },
        followUpQuestions: [
          'What career pressures feel most overwhelming right now?',
          'How do you handle comments about your career choices from relatives or family friends?',
          'What would your ideal career look like if there were no external pressures?'
        ],
        scoringWeight: 1.8,
        category: 'career_anxiety'
      },
      {
        id: 'social_comparison_1',
        type: 'conversational',
        originalText: 'Social comparison and peer pressure',
        conversationalPrompt: 'It\'s natural to compare ourselves to others, but sometimes it can become overwhelming. How do you feel when you hear about your friends\' or cousins\' achievements?',
        culturalAdaptations: {
          'urban': 'In cities, there\'s often a lot of competition and comparison. How does this affect you?',
          'small_town': 'In smaller communities, everyone knows everyone\'s business. How do you handle the comparisons and expectations?',
          'hindi': 'दोस्तों और रिश्तेदारों की सफलता सुनकर आप कैसा महसूस करते हैं?'
        },
        followUpQuestions: [
          'Which comparisons affect you the most?',
          'How do social media and family gatherings impact these feelings?',
          'What helps you feel confident in your own journey?'
        ],
        scoringWeight: 1.5,
        category: 'social_comparison'
      },
      {
        id: 'cultural_identity_1',
        type: 'conversational',
        originalText: 'Cultural identity and modern life balance',
        conversationalPrompt: 'Sometimes it can be challenging to balance traditional values with modern life, especially for our generation. Do you ever feel torn between different expectations or ways of living?',
        culturalAdaptations: {
          'traditional_family': 'Coming from a traditional background while living in a modern world can create unique challenges. How do you navigate this?',
          'liberal_family': 'Even in more liberal families, there can be cultural expectations. How do you balance tradition with your personal choices?',
          'hindi': 'पारंपरिक मूल्यों और आधुनिक जीवन के बीच संतुलन बनाना कैसा लगता है?'
        },
        followUpQuestions: [
          'Can you give me an example of when you felt this cultural conflict?',
          'How do you decide which traditions to follow and which to adapt?',
          'Who do you talk to when you feel caught between different cultural expectations?'
        ],
        scoringWeight: 1.7,
        category: 'identity_conflict'
      }
    ];

    // Customize questions based on user profile
    return this.customizeQuestionsForUser(baseQuestions, userProfile);
  }

  private customizeQuestionsForUser(questions: AssessmentQuestion[], userProfile: SimpleUserProfile): AssessmentQuestion[] {
    // Filter and adapt questions based on user's age, background, etc.
    const customizedQuestions = questions.filter(q => {
      // Skip marriage questions for very young users
      if (q.category === 'marriage_stress' && userProfile.age < 20) {
        return false;
      }

      // Skip certain financial questions for students
      if (q.category === 'financial_worries' && userProfile.age < 22) {
        return false;
      }

      return true;
    });

    // Adapt language and cultural context
    return customizedQuestions.map(q => ({
      ...q,
      conversationalPrompt: this.adaptPromptForUser(q, userProfile)
    }));
  }

  private adaptPromptForUser(question: AssessmentQuestion, userProfile: SimpleUserProfile): string {
    // Select most appropriate cultural adaptation
    const culturalContext = userProfile.culturalBackground;

    // Age-based adaptations
    if (userProfile.age <= 20 && question.culturalAdaptations['student']) {
      return question.culturalAdaptations['student'];
    } else if (userProfile.age >= 25 && question.culturalAdaptations['graduate']) {
      return question.culturalAdaptations['graduate'];
    }

    // Family structure adaptations
    if (culturalContext?.familyStructure === 'joint' && question.culturalAdaptations['joint_family']) {
      return question.culturalAdaptations['joint_family'];
    } else if (culturalContext?.familyStructure === 'nuclear' && question.culturalAdaptations['nuclear_family']) {
      return question.culturalAdaptations['nuclear_family'];
    }

    // Location-based adaptations
    if (userProfile.location?.includes('Mumbai') || userProfile.location?.includes('Delhi') || userProfile.location?.includes('Bangalore')) {
      if (question.culturalAdaptations['urban']) {
        return question.culturalAdaptations['urban'];
      }
    }

    return question.conversationalPrompt;
  }

  private async conductConversationalAssessment(
    questions: AssessmentQuestion[],
    userProfile: SimpleUserProfile
  ): Promise<any[]> {
    // This would integrate with the main conversational assessment flow
    // For now, returning mock responses for demonstration
    return questions.map((q) => ({
      questionId: q.id,
      category: q.category,
      score: Math.floor(Math.random() * 4), // 0-3 scale
      culturalFactors: this.identifyRelevantCulturalFactors(q, userProfile),
      emotionalIntensity: Math.floor(Math.random() * 5) + 1 // 1-5 scale
    }));
  }

  private identifyRelevantCulturalFactors(question: AssessmentQuestion, userProfile: SimpleUserProfile): string[] {
    const factors: string[] = [];

    // Add factors based on question category and user profile
    switch (question.category) {
      case 'academic_pressure':
        factors.push('competitive_education_system', 'parental_investment_in_education');
        if (userProfile.age <= 22) factors.push('exam_culture');
        break;
      case 'family_expectations':
        factors.push('collectivist_culture', 'intergenerational_expectations');
        if (userProfile.culturalBackground?.familyStructure === 'joint') {
          factors.push('joint_family_dynamics');
        }
        break;
      case 'career_anxiety':
        factors.push('job_market_competition', 'social_status_through_career');
        break;
      case 'marriage_stress':
        if (userProfile.age >= 23) {
          factors.push('arranged_marriage_system', 'family_involvement_in_relationships');
        }
        break;
    }

    return factors;
  }

  private async analyzeCulturalPressures(responses: any[], userProfile: SimpleUserProfile): Promise<CulturalPressureAssessment> {
    const assessment: CulturalPressureAssessment = {
      academicPressure: 0,
      familyExpectations: 0,
      careerAnxiety: 0,
      marriageStress: 0,
      socialComparison: 0,
      financialWorries: 0,
      identityConflict: 0,
      overallCulturalStress: 0
    };

    // Calculate category scores
    responses.forEach(response => {
      switch (response.category) {
        case 'academic_pressure':
          assessment.academicPressure += response.score;
          break;
        case 'family_expectations':
          assessment.familyExpectations += response.score;
          break;
        case 'career_anxiety':
          assessment.careerAnxiety += response.score;
          break;
        case 'marriage_stress':
          assessment.marriageStress += response.score;
          break;
        case 'social_comparison':
          assessment.socialComparison += response.score;
          break;
        case 'financial_worries':
          assessment.financialWorries += response.score;
          break;
        case 'identity_conflict':
          assessment.identityConflict += response.score;
          break;
      }
    });

    // Calculate overall cultural stress
    assessment.overallCulturalStress = (
      assessment.academicPressure +
      assessment.familyExpectations +
      assessment.careerAnxiety +
      assessment.marriageStress +
      assessment.socialComparison +
      assessment.financialWorries +
      assessment.identityConflict
    ) / 7;

    return assessment;
  }

  async generateCulturallySpecificRecommendations(
    assessment: CulturalPressureAssessment,
    userProfile: SimpleUserProfile
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Academic pressure recommendations
    if (assessment.academicPressure >= 2) {
      recommendations.push(
        'Consider reframing academic success - excellence comes in many forms, not just traditional metrics'
      );
      recommendations.push(
        'Practice communicating with family about academic stress in a way that honors their investment while expressing your needs'
      );
    }

    // Family expectations recommendations
    if (assessment.familyExpectations >= 2) {
      recommendations.push(
        'Explore ways to honor family values while creating space for your individual growth'
      );
      recommendations.push(
        'Consider family therapy activities that can improve understanding between generations'
      );
    }

    // Career anxiety recommendations
    if (assessment.careerAnxiety >= 2) {
      recommendations.push(
        'Explore diverse career paths that align with both your interests and cultural values around stability'
      );
      recommendations.push(
        'Practice articulating your career choices in ways that help family understand your perspective'
      );
    }

    // Cultural identity recommendations
    if (assessment.identityConflict >= 2) {
      recommendations.push(
        'Explore activities that help you integrate traditional wisdom with modern life choices'
      );
      recommendations.push(
        'Connect with others who are navigating similar cultural balance challenges'
      );
    }

    return recommendations;
  }

  async identifyHighRiskCulturalFactors(
    assessment: CulturalPressureAssessment,
    userProfile: SimpleUserProfile
  ): Promise<IndianCulturalStressor[]> {
    const highRiskFactors: IndianCulturalStressor[] = [];

    // Check each category for high risk
    if (assessment.academicPressure >= 3) {
      const academicStressors = this.culturalStressors.get('academic') || [];
      highRiskFactors.push(...academicStressors.filter(s => s.severity === 'high'));
    }

    if (assessment.familyExpectations >= 3) {
      const familyStressors = this.culturalStressors.get('family') || [];
      highRiskFactors.push(...familyStressors.filter(s => s.severity === 'high'));
    }

    if (assessment.careerAnxiety >= 3) {
      const careerStressors = this.culturalStressors.get('career') || [];
      highRiskFactors.push(...careerStressors.filter(s => s.severity === 'high'));
    }

    // Sort by intervention priority
    return highRiskFactors.sort((a, b) => b.interventionPriority - a.interventionPriority);
  }
}