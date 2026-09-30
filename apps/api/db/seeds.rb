# Create demo account
account = Account.create!(
  name: "Bean & Brew",
  slug: "bean-brew"
)

# Create owner
owner = User.create!(
  name: "Sarah",
  email: "sarah@beanandbrew.com",
  password: "password123",
  current_account: account
)

Membership.create!(account: account, user: owner, role: :owner)

puts "Created account: #{account.name} (#{account.slug})"
puts "Created owner: #{owner.email}"

# Create pipeline with stages
pipeline = account.pipelines.create!(name: "Sales Pipeline", is_default: true)

stages_data = [
  { name: "New Lead", position: 0, color: "#3B82F6", probability: 10, kind: :open },
  { name: "Contacted", position: 1, color: "#8B5CF6", probability: 25, kind: :open },
  { name: "Proposal Sent", position: 2, color: "#F59E0B", probability: 50, kind: :open },
  { name: "Negotiation", position: 3, color: "#F97316", probability: 75, kind: :open },
  { name: "Won", position: 4, color: "#10B981", probability: 100, kind: :won },
  { name: "Lost", position: 5, color: "#EF4444", probability: 0, kind: :lost }
]

stages = stages_data.map { |data| pipeline.stages.create!(**data, account_id: account.id) }
puts "Created pipeline: #{pipeline.name} with #{stages.count} stages"

# Create companies
companies_data = [
  { name: "TechStart Inc.", domain: "techstart.com", industry: "Technology", size_range: "10-50" },
  { name: "Green Leaf Café", domain: "greenleafcafe.com", industry: "Food & Beverage", size_range: "1-10" },
  { name: "Summit Construction", domain: "summitconstruction.com", industry: "Construction", size_range: "50-200" },
  { name: "Pacific Legal Group", domain: "pacificlegal.com", industry: "Legal", size_range: "10-50" },
  { name: "Coastal Fitness", domain: "coastalfitness.com", industry: "Health & Fitness", size_range: "1-10" },
  { name: "Brightside Marketing", domain: "brightsidemarketing.com", industry: "Marketing", size_range: "10-50" },
  { name: "Harborview Realty", domain: "harborviewrealty.com", industry: "Real Estate", size_range: "10-50" },
  { name: "Oakwood Elementary", domain: "oakwoodelementary.edu", industry: "Education", size_range: "50-200" },
]

companies = companies_data.map do |data|
  account.companies.create!(**data, owner: owner)
end
puts "Created #{companies.count} companies"

# Create contacts
contacts_data = [
  { first_name: "Mike", last_name: "Chen", email: "mike@techstart.com", phone: "555-0101", company: companies[0] },
  { first_name: "Lisa", last_name: "Park", email: "lisa@greenleafcafe.com", phone: "555-0102", company: companies[1] },
  { first_name: "James", last_name: "Wilson", email: "james@summitconstruction.com", phone: "555-0103", company: companies[2] },
  { first_name: "Maria", last_name: "Garcia", email: "maria@pacificlegal.com", phone: "555-0104", company: companies[3] },
  { first_name: "Tom", last_name: "Bradley", email: "tom@coastalfitness.com", phone: "555-0105", company: companies[4] },
  { first_name: "Emma", last_name: "Wilson", email: "emma@brightsidemarketing.com", phone: "555-0106", company: companies[5] },
  { first_name: "David", last_name: "Kim", email: "david@harborviewrealty.com", phone: "555-0107", company: companies[6] },
  { first_name: "Rachel", last_name: "Thompson", email: "rachel@oakwoodelementary.edu", phone: "555-0108", company: companies[7] },
  { first_name: "Alex", last_name: "Johnson", email: "alex@techstart.com", phone: "555-0109", company: companies[0] },
  { first_name: "Sophie", last_name: "Lee", email: "sophie@greenleafcafe.com", phone: "555-0110", company: companies[1] },
  { first_name: "Chris", last_name: "Martinez", email: "chris@summitconstruction.com", phone: "555-0111", company: companies[2] },
  { first_name: "Nina", last_name: "Patel", email: "nina@brightsidemarketing.com", phone: "555-0112", company: companies[5] },
]

contacts = contacts_data.map do |data|
  account.contacts.create!(**data, owner: owner, status: :lead)
end
puts "Created #{contacts.count} contacts"

# Create deals
deals_data = [
  { title: "TechStart Office Coffee Service", amount: 600, currency: "USD", contact: contacts[0], company: companies[0], stage: stages[2], expected_close_date: 7.days.from_now, source: "referral" },
  { title: "Green Leaf Catering Package", amount: 1200, currency: "USD", contact: contacts[1], company: companies[1], stage: stages[3], expected_close_date: 14.days.from_now, source: "event" },
  { title: "Summit Construction Lunch Program", amount: 800, currency: "USD", contact: contacts[2], company: companies[2], stage: stages[1], expected_close_date: 21.days.from_now, source: "cold outreach" },
  { title: "Pacific Legal Weekly Delivery", amount: 400, currency: "USD", contact: contacts[3], company: companies[3], stage: stages[0], expected_close_date: 30.days.from_now, source: "website" },
  { title: "Coastal Fitness Protein Bars", amount: 300, currency: "USD", contact: contacts[4], company: companies[4], stage: stages[0], expected_close_date: 14.days.from_now, source: "social" },
  { title: "Brightside Marketing Event", amount: 2000, currency: "USD", contact: contacts[5], company: companies[5], stage: stages[4], expected_close_date: -3.days.from_now, closed_at: 3.days.ago, source: "referral" },
  { title: "Harborview Open House", amount: 500, currency: "USD", contact: contacts[6], company: companies[6], stage: stages[1], expected_close_date: 10.days.from_now, source: "website" },
  { title: "Oakfield School Fundraiser", amount: 1500, currency: "USD", contact: contacts[7], company: companies[7], stage: stages[2], expected_close_date: 21.days.from_now, source: "event" },
  { title: "Downtown Gym Trial", amount: 250, currency: "USD", contact: contacts[4], company: companies[4], stage: stages[5], expected_close_date: -10.days.from_now, closed_at: 10.days.ago, source: "cold outreach" },
]

deals = deals_data.map do |data|
  account.deals.create!(**data, owner: owner, pipeline: pipeline)
end
puts "Created #{deals.count} deals"

# Create tags
tags_data = [
  { name: "hot-lead", color: "#EF4444" },
  { name: "cold-lead", color: "#3B82F6" },
  { name: "wholesale", color: "#10B981" },
  { name: "catering", color: "#F59E0B" },
  { name: "new-business", color: "#8B5CF6" },
  { name: "repeat-customer", color: "#06B6D4" },
]

tags = tags_data.map do |data|
  account.tags.create!(**data)
end
puts "Created #{tags.count} tags"

# Tag some contacts and deals
Tagging.create!(account: account, tag: tags[0], taggable: contacts[0])  # Mike - hot-lead
Tagging.create!(account: account, tag: tags[2], taggable: contacts[0])  # Mike - wholesale
Tagging.create!(account: account, tag: tags[3], taggable: contacts[1])  # Lisa - catering
Tagging.create!(account: account, tag: tags[4], taggable: contacts[3])  # Maria - new-business
Tagging.create!(account: account, tag: tags[5], taggable: contacts[5])  # Emma - repeat-customer
Tagging.create!(account: account, tag: tags[0], taggable: deals[0])     # TechStart deal - hot-lead
Tagging.create!(account: account, tag: tags[3], taggable: deals[1])     # Green Leaf deal - catering
tagging_count = Tagging.where(account: account).count
puts "Created #{tagging_count} taggings"

# Create activities
activities_data = [
  { kind: :call, subject: "Discovery call with Mike", description: "Discussed office coffee needs for 30 employees", contact: contacts[0], deal: deals[0], due_at: 2.days.ago },
  { kind: :email, subject: "Sent proposal to Lisa", description: "Emailed catering package options", contact: contacts[1], deal: deals[1], due_at: 1.day.ago },
  { kind: :meeting, subject: "Site visit to Summit", description: "Toured their new office space", contact: contacts[2], deal: deals[2], due_at: 3.days.ago },
  { kind: :task, subject: "Follow up with Maria", description: "Send pricing sheet for weekly delivery", contact: contacts[3], deal: deals[3], due_at: 1.day.from_now },
  { kind: :call, subject: "Initial call with Tom", description: "Interested in protein bar subscription", contact: contacts[4], deal: deals[4], due_at: 4.days.ago },
  { kind: :email, subject: "Thank you to Emma", description: "Sent thank you after event", contact: contacts[5], deal: deals[5], due_at: 5.days.ago },
  { kind: :task, subject: "Prepare proposal for Harborview", description: "Create custom catering proposal", contact: contacts[6], deal: deals[6], due_at: 2.days.from_now },
  { kind: :meeting, subject: "School fundraiser planning", description: "Met with Rachel to plan coffee station", contact: contacts[7], deal: deals[7], due_at: 5.days.from_now },
]

activities_data.each do |data|
  account.activities.create!(**data, creator: owner, completed_at: data[:due_at] < Time.current ? data[:due_at] + 1.hour : nil)
end
puts "Created #{account.activities.count} activities"

# Create notes
notes_data = [
  { body: "Mike prefers single-origin Ethiopian beans. Allergic to nuts.", notable: contacts[0] },
  { body: "Lisa wants cold brew station for the wedding. Needs 4 servers.", notable: contacts[1] },
  { body: "Summit just moved to new office. 50 employees, kitchen on 3rd floor.", notable: contacts[2] },
  { body: "Maria handles all vendor relationships. Budget approval needed from partner.", notable: contacts[3] },
  { body: "TechStart office coffee service. 30 staff, prefer dark roast. Monthly billing.", notable: deals[0] },
  { body: "Green Leaf catering. Wedding on June 15. 150 guests. Cold brew + espresso.", notable: deals[1] },
]

notes_data.each do |data|
  account.notes.create!(**data, author: owner)
end
puts "Created #{account.notes.count} notes"

# Create emails
emails_data = [
  { direction: :outbound, from_address: "sarah@beanandbrew.com", to_addresses: ["mike@techstart.com"], subject: "Re: Office Coffee Service", body: "Hi Mike, thanks for your interest! I've attached our pricing for the office coffee service.", contact: contacts[0], deal: deals[0], status: :sent, sent_at: 2.days.ago },
  { direction: :inbound, from_address: "lisa@greenleafcafe.com", to_addresses: ["sarah@beanandbrew.com"], subject: "Catering Inquiry", body: "Hi Sarah, we're planning a wedding and need coffee service for 150 guests.", contact: contacts[1], deal: deals[1], status: :delivered, sent_at: 3.days.ago },
  { direction: :outbound, from_address: "sarah@beanandbrew.com", to_addresses: ["james@summitconstruction.com"], subject: "Welcome to Bean & Brew", body: "Hi James, welcome! We'd love to set up a lunch program for your team.", contact: contacts[2], deal: deals[2], status: :sent, sent_at: 1.day.ago },
]

emails_data.each do |data|
  account.emails.create!(**data)
end
puts "Created #{account.emails.count} emails"

# Create saved view
account.saved_views.create!(
  user: owner,
  entity_type: "Contact",
  name: "Hot Leads",
  filters: { status: "lead" },
  sort: { field: "lead_score", order: "desc" },
  columns: ["first_name", "last_name", "email", "company", "lead_score"],
  shared: true
)

account.saved_views.create!(
  user: owner,
  entity_type: "Deal",
  name: "Closing This Week",
  filters: { expected_close_date: "this_week" },
  sort: { field: "amount", order: "desc" },
  columns: ["title", "amount", "stage", "contact", "expected_close_date"],
  shared: true
)

puts "Created #{account.saved_views.count} saved views"

# Demo custom fields (idempotent so re-seeding is safe)
plan_field = account.custom_field_definitions.find_or_create_by!(entity_type: "Contact", key: "plan") do |f|
  f.label = "Plan"
  f.field_type = :select
  f.options = { "choices" => %w[free pro enterprise] }
  f.position = 0
end
renewal_field = account.custom_field_definitions.find_or_create_by!(entity_type: "Company", key: "renewal_date") do |f|
  f.label = "Renewal date"
  f.field_type = :date
  f.position = 0
end
contacts[0].update!(custom_data: { "plan" => "enterprise" }) if contacts[0].custom_data.blank?
contacts[1].update!(custom_data: { "plan" => "pro" }) if contacts[1].custom_data.blank?
companies[0].update!(custom_data: { "renewal_date" => 90.days.from_now.to_date.iso8601 }) if companies[0].custom_data.blank?
puts "Seeded #{account.custom_field_definitions.count} custom field definitions"

puts "\n=== Seed Complete ==="
puts "Login: sarah@beanandbrew.com / password123"
