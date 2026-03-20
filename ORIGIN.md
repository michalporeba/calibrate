# Calibrate

A local first, but interoperable, web tool for assessments.

## Context

Public service is full of assessments that are meant to ensure fairness and resilience. 
The assessment come in various shapes, but they often have a common core. 
There is a detailed description of what is required. There might be guidance to help with the interpretation of that. 
Then somebody describes how subject of the assessment meets (or a degree to which it meets it), sometimes with a score. 
It might be that multiple people independently do such an assessment. 
Then there is a moderation or a review stage when either multiple assessors reconcile their differences, 
or somebody else reviews the initial assessments. 

Examples:
 - GDaD Capability Framework self-assessment. People in GDaD professions must self assess yearly. 
   https://ddat-capability-framework.service.gov.uk/
 - Data Maturity Assessment. 
   https://www.gov.uk/government/publications/data-maturity-assessment-for-government-framework
 - Recruitment often follows very strict assessment of candidates.
 - Procurement often involves very detailed assessment of bids. 

It might be too complex to try to implement different assessment types. 
If that's the case `calibrate` should be about GDaD Capability Framework self assessments. 
If it is possible about other self assessments, self-reflection like in continuous professional development, 
and only then if it is not too difficult, doesn't add too much complexity, about maturity assessments. 

## Personal data and experience

Many of the assessments are official data which needs to be held by an organisation. 
However, in case of capability self-assessment, this is personal record and information. 
It should not contain anything identifiable or sensitive to avoid bias in the review stage. 
And it should be possible to take it with you from organisation to organisation. 

Because of this, the Calibrate project should support storing data in SOLID Pods and work local-first.

At the same time, it must be possible to connect to corporate data backends for other types of assessments. 

## Technical Challenges and Constraints

 - It should be a local-first website
 - The theme should be customisable but the workflow and layout of screen can be standardised for simplicity
 - The workflow and layout should be made such that it fits naturaly into GDS Design System
 - GDS Design System should be the default theme with at least one alternative for testing. 
 - the application shoudl be multi-lingual to support multiple official languages in UK (initially English and Welsh)
 - Personal data sohuld be stored as RDF locally or in SOLID Pods 
 - The authentication should be connected to SOLID Pods infrastructure. 
 - The corporate, shared data store is a secondary problem. If it can be accomodated from the start - great, if not - that's OK, too. 
 - The assessment templates should not be part of the application itself but rather come from external sources, perhaps repositories. 
 - To avoid problems with changes, once an assessment is started, all its questions should be captured in the local data
 - internal data model should avoid using specific terms from any specific assessment to make it configurable and flexible. 
 - It should be possible to develop templates using basic tools, perhaps just text editors - md files with front matter and some yml files.

## Assessments

The assessments need to be configurable, but the initial and primary objective is to help with GDaD Capability Framework self assessments. 
Secondary goal is to support maturity assessments, like the data maturity assessment. 
Everything else is a problem for later. 

### GDaD Capability Assessment Structure and Flow

Assessment defines:
 - **Role Family** - a grouping of role profiles. On the website each job profile can be only in one role family, but it might be better user experience
   if it was possible to put some role profiles in multiple families. 
 - **Roles** - a role (or a job profile) has a name, a description describing its core purpose, and a collection of role levels, and skills. 
   Role levels and skills form a matrix describing what level of proficiency should a person have in a given role at a given role level. 
 - **Role Level** - a version of a role that defines what specific skill proficiency the role require at that level. 
 - **Grade** - Civil service grades (names differ per organisation) on which a specific role level is. The GDaD framework often provides two typical levels
   but each organisation will decide on which level they implement the role level
 - **Skill** - The capaiblity framework defines skills. They consist of name, description and skill levels
 - **Skill Level** (or proficiency) - consists of a specific description of what ability is expected to claim a given proficiency level in the skill
 - **Proficiency** - a step on a proficiency scale. In GDaD self assessment it is 4 step scale: Awareness, Working, Proficient, Expert.
   Each step at the scale comes with a description of what it means. This needs to be configurable, as some departments add extra steps, like Expert+
   If the `calibrate` was to be extended beyond GDaD self-assessment, the scales might be different, a scale 0-10, yes/no. 
   Perhaps proficiency is not the right name for this. 
 - **Indicator** - Skills can be shared between roles - one skill is part of multiple roles. In such cases the role level may have different proficiency requirements.
   Also, slightly different things can be meant by the skill. To help people contextualise given skill at its level we have indicators.
   Indicators are for a specific skill level for a role and comes with extra text, often bullet points - similarly to the skill description. 

There is a standard set of skills and roles with recommended grades. 
However, there are multiple grade structures and so each organisation needs to choose the grades system and specific grade for each role level. 
Organisations can also add proficiency levels, and in such case they have to define requirements for skills at that level
Organisations can overwrite roles including role description, required skills and and skill levels.
They can add indicators - indicators are not pare of central framework. 


