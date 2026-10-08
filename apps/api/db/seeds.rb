# Demo seed: Bean & Brew workspace with enough breadth to exercise every
# major surface (CRM, pipeline, activities, email, sequences, automations,
# tags, notes, custom fields). Idempotent for the demo account: re-running
# finds the existing workspace and only fills gaps, so local logins,
# memberships, and tokens survive a reseed.
demo_account = Account.find_or_create_by!(slug: "bean-brew") do |account|
  account.name = "Bean & Brew"
end
account = demo_account

owner = User.find_or_initialize_by(email: "sarah@beanandbrew.com")
if owner.new_record?
  owner.assign_attributes(name: "Sarah", password: "password123", current_account: account)
  owner.save!
end
Membership.find_or_create_by!(account: account, user: owner) do |membership|
  membership.role = :owner
end
owner.update!(current_account: account) if owner.current_account.nil?

teammate = User.find_or_initialize_by(email: "alex@beanandbrew.com")
if teammate.new_record?
  teammate.assign_attributes(name: "Alex Rivera", password: "password123", current_account: account)
  teammate.save!
end
Membership.find_or_create_by!(account: account, user: teammate) do |membership|
  membership.role = :member
end
teammate.update!(current_account: account) if teammate.current_account.nil?

puts "Seed account: #{account.name} (#{account.slug})"
puts "Seed users: #{owner.email}, #{teammate.email}"

# Pipeline with stages (Pipeline#after_create seeds the default
# New/Contacted/Proposal/Negotiation/Won/Lost stages — reuse them instead
# of creating a second set).
pipeline = account.pipelines.find_or_create_by!(name: "Sales Pipeline") do |record|
  record.is_default = true
end
account.pipelines.where.not(id: pipeline.id).find_each do |extra|
  extra.update!(is_default: false)
end
pipeline.update!(is_default: true) unless pipeline.is_default?

stages = pipeline.stages.order(:position).to_a
puts "Pipeline: #{pipeline.name} with #{stages.count} stages"

def seed_address(street:, city:, postal_code:, state: nil, country: "USA")
  { "street" => street, "city" => city, "state" => state,
    "postal_code" => postal_code, "country" => country }.compact
end

# Companies: original eight plus six more, with billing/shipping split.
# Shipping differs only where it tells a story (cafe event site, school
# district warehouse); otherwise it mirrors billing.
companies_data = [
  { name: "TechStart Inc.", domain: "techstart.com", industry: "Technology", size_range: "10-50",
    address: "100 Market St, San Francisco, CA",
    billing: seed_address(street: "100 Market St", city: "San Francisco", state: "CA", postal_code: "94105"),
    shipping: seed_address(street: "100 Market St", city: "San Francisco", state: "CA", postal_code: "94105") },
  { name: "Green Leaf Café", domain: "greenleafcafe.com", industry: "Food & Beverage", size_range: "1-10",
    address: "14 Elm St, Portland, OR",
    billing: seed_address(street: "14 Elm St", city: "Portland", state: "OR", postal_code: "97205"),
    shipping: seed_address(street: "Rose Garden Pavilion", city: "Portland", state: "OR", postal_code: "97205") },
  { name: "Summit Construction", domain: "summitconstruction.com", industry: "Construction", size_range: "50-200",
    address: "900 Summit Ave, Denver, CO",
    billing: seed_address(street: "900 Summit Ave", city: "Denver", state: "CO", postal_code: "80202"),
    shipping: seed_address(street: "Yard 3, 4500 Industrial Pkwy", city: "Denver", state: "CO", postal_code: "80216") },
  { name: "Pacific Legal Group", domain: "pacificlegal.com", industry: "Legal", size_range: "10-50",
    address: "600 Harbor Dr, San Diego, CA",
    billing: seed_address(street: "600 Harbor Dr", city: "San Diego", state: "CA", postal_code: "92101"),
    shipping: seed_address(street: "600 Harbor Dr", city: "San Diego", state: "CA", postal_code: "92101") },
  { name: "Coastal Fitness", domain: "coastalfitness.com", industry: "Health & Fitness", size_range: "1-10",
    address: "77 Ocean Blvd, Santa Monica, CA",
    billing: seed_address(street: "77 Ocean Blvd", city: "Santa Monica", state: "CA", postal_code: "90402"),
    shipping: seed_address(street: "77 Ocean Blvd", city: "Santa Monica", state: "CA", postal_code: "90402") },
  { name: "Brightside Marketing", domain: "brightsidemarketing.com", industry: "Marketing", size_range: "10-50",
    address: "220 Madison Ave, New York, NY",
    billing: seed_address(street: "220 Madison Ave", city: "New York", state: "NY", postal_code: "10016"),
    shipping: seed_address(street: "220 Madison Ave", city: "New York", state: "NY", postal_code: "10016") },
  { name: "Harborview Realty", domain: "harborviewrealty.com", industry: "Real Estate", size_range: "10-50",
    address: "45 Bay St, Seattle, WA",
    billing: seed_address(street: "45 Bay St", city: "Seattle", state: "WA", postal_code: "98101"),
    shipping: seed_address(street: "45 Bay St", city: "Seattle", state: "WA", postal_code: "98101") },
  { name: "Oakwood Elementary", domain: "oakwoodelementary.edu", industry: "Education", size_range: "50-200",
    address: "300 School Ln, Austin, TX",
    billing: seed_address(street: "300 School Ln", city: "Austin", state: "TX", postal_code: "78704"),
    shipping: seed_address(street: "District Warehouse, 1200 E 6th St", city: "Austin", state: "TX", postal_code: "78702") },
  { name: "Northwind Traders", domain: "northwindtraders.com", industry: "Retail", size_range: "200-500",
    address: "500 Commerce St, Chicago, IL",
    billing: seed_address(street: "500 Commerce St", city: "Chicago", state: "IL", postal_code: "60654"),
    shipping: seed_address(street: "Dock 7, 1500 W Fulton Mkt", city: "Chicago", state: "IL", postal_code: "60607") },
  { name: "Bluefin Logistics", domain: "bluefinlogistics.com", industry: "Logistics", size_range: "50-200",
    address: "12 Portside Ave, Oakland, CA",
    billing: seed_address(street: "12 Portside Ave", city: "Oakland", state: "CA", postal_code: "94607"),
    shipping: seed_address(street: "12 Portside Ave", city: "Oakland", state: "CA", postal_code: "94607") },
  { name: "Sunrise Dental", domain: "sunrisedental.com", industry: "Healthcare", size_range: "10-50",
    address: "88 Sunrise Blvd, Phoenix, AZ",
    billing: seed_address(street: "88 Sunrise Blvd", city: "Phoenix", state: "AZ", postal_code: "85004"),
    shipping: seed_address(street: "88 Sunrise Blvd", city: "Phoenix", state: "AZ", postal_code: "85004") },
  { name: "Copper Canyon Coffee", domain: "coppercanyon.coffee", industry: "Food & Beverage", size_range: "1-10",
    address: "9 Canyon Rd, Sedona, AZ",
    billing: seed_address(street: "9 Canyon Rd", city: "Sedona", state: "AZ", postal_code: "86336"),
    shipping: seed_address(street: "9 Canyon Rd", city: "Sedona", state: "AZ", postal_code: "86336") },
  { name: "Lakeside Books", domain: "lakesidebooks.com", industry: "Retail", size_range: "1-10",
    address: "210 Lake St, Madison, WI",
    billing: seed_address(street: "210 Lake St", city: "Madison", state: "WI", postal_code: "53703"),
    shipping: seed_address(street: "210 Lake St", city: "Madison", state: "WI", postal_code: "53703") },
  { name: "Vertex Architects", domain: "vertexarch.com", industry: "Architecture", size_range: "10-50",
    address: "400 Design District Blvd, Dallas, TX",
    billing: seed_address(street: "400 Design District Blvd", city: "Dallas", state: "TX", postal_code: "75207"),
    shipping: seed_address(street: "400 Design District Blvd", city: "Dallas", state: "TX", postal_code: "75207") },
]

companies = companies_data.map do |data|
  company = account.companies.find_or_initialize_by(name: data[:name])
  company.assign_attributes(
    domain: data[:domain], industry: data[:industry], size_range: data[:size_range],
    address: data[:address], billing_address: data[:billing], shipping_address: data[:shipping],
    owner: owner
  )
  company.save!
  company
end
puts "Companies: #{account.companies.kept.count}"

# Contacts part 1: original twelve with statuses, titles, and addresses.
contacts_data = [
  { first_name: "Mike", last_name: "Chen", email: "mike@techstart.com", phone: "555-0101", company: companies[0], status: :customer, job_title: "Office Manager", city: "San Francisco",
    billing: seed_address(street: "100 Market St", city: "San Francisco", state: "CA", postal_code: "94105"),
    shipping: seed_address(street: "100 Market St", city: "San Francisco", state: "CA", postal_code: "94105") },
  { first_name: "Lisa", last_name: "Park", email: "lisa@greenleafcafe.com", phone: "555-0102", company: companies[1], status: :lead, job_title: "Events Lead", city: "Portland",
    billing: seed_address(street: "14 Elm St", city: "Portland", state: "OR", postal_code: "97205"), shipping: {} },
  { first_name: "James", last_name: "Wilson", email: "james@summitconstruction.com", phone: "555-0103", company: companies[2], status: :lead, job_title: "Facilities Director", city: "Denver",
    billing: seed_address(street: "900 Summit Ave", city: "Denver", state: "CO", postal_code: "80202"),
    shipping: seed_address(street: "Yard 3, 4500 Industrial Pkwy", city: "Denver", state: "CO", postal_code: "80216") },
  { first_name: "Maria", last_name: "Garcia", email: "maria@pacificlegal.com", phone: "555-0104", company: companies[3], status: :customer, job_title: "Office Administrator", city: "San Diego",
    billing: seed_address(street: "600 Harbor Dr", city: "San Diego", state: "CA", postal_code: "92101"),
    shipping: seed_address(street: "600 Harbor Dr", city: "San Diego", state: "CA", postal_code: "92101") },
  { first_name: "Tom", last_name: "Bradley", email: "tom@coastalfitness.com", phone: "555-0105", company: companies[4], status: :lead, job_title: "Owner", city: "Santa Monica",
    billing: {}, shipping: {} },
  { first_name: "Emma", last_name: "Wilson", email: "emma@brightsidemarketing.com", phone: "555-0106", company: companies[5], status: :customer, job_title: "Culture Lead", city: "New York",
    billing: seed_address(street: "220 Madison Ave", city: "New York", state: "NY", postal_code: "10016"),
    shipping: seed_address(street: "220 Madison Ave", city: "New York", state: "NY", postal_code: "10016") },
  { first_name: "David", last_name: "Kim", email: "david@harborviewrealty.com", phone: "555-0107", company: companies[6], status: :lead, job_title: "Broker", city: "Seattle",
    billing: seed_address(street: "45 Bay St", city: "Seattle", state: "WA", postal_code: "98101"), shipping: {} },
  { first_name: "Rachel", last_name: "Thompson", email: "rachel@oakwoodelementary.edu", phone: "555-0108", company: companies[7], status: :lead, job_title: "PTA President", city: "Austin",
    billing: seed_address(street: "300 School Ln", city: "Austin", state: "TX", postal_code: "78704"),
    shipping: seed_address(street: "District Warehouse, 1200 E 6th St", city: "Austin", state: "TX", postal_code: "78702") },
  { first_name: "Alex", last_name: "Johnson", email: "alex@techstart.com", phone: "555-0109", company: companies[0], status: :lead, job_title: "Engineer", city: "San Francisco",
    billing: {}, shipping: {} },
  { first_name: "Sophie", last_name: "Lee", email: "sophie@greenleafcafe.com", phone: "555-0110", company: companies[1], status: :lead, job_title: "Barista", city: "Portland",
    billing: {}, shipping: {} },
  { first_name: "Chris", last_name: "Martinez", email: "chris@summitconstruction.com", phone: "555-0111", company: companies[2], status: :lead, job_title: "Project Manager", city: "Denver",
    billing: {}, shipping: {} },
  { first_name: "Nina", last_name: "Patel", email: "nina@brightsidemarketing.com", phone: "555-0112", company: companies[5], status: :lead, job_title: "Designer", city: "New York",
    billing: {}, shipping: {} },
  # Contacts part 2: eight more covering customers, churned, and unaffiliated buyers.
  { first_name: "Grace", last_name: "Nguyen", email: "grace@northwindtraders.com", phone: "555-0113", company: companies[8], status: :customer, job_title: "Procurement Manager", city: "Chicago",
    billing: seed_address(street: "500 Commerce St", city: "Chicago", state: "IL", postal_code: "60654"),
    shipping: seed_address(street: "Dock 7, 1500 W Fulton Mkt", city: "Chicago", state: "IL", postal_code: "60607") },
  { first_name: "Omar", last_name: "Haddad", email: "omar@bluefinlogistics.com", phone: "555-0114", company: companies[9], status: :lead, job_title: "Dispatch Lead", city: "Oakland",
    billing: seed_address(street: "12 Portside Ave", city: "Oakland", state: "CA", postal_code: "94607"), shipping: {} },
  { first_name: "Priya", last_name: "Nair", email: "priya@sunrisedental.com", phone: "555-0115", company: companies[10], status: :customer, job_title: "Practice Manager", city: "Phoenix",
    billing: seed_address(street: "88 Sunrise Blvd", city: "Phoenix", state: "AZ", postal_code: "85004"),
    shipping: seed_address(street: "88 Sunrise Blvd", city: "Phoenix", state: "AZ", postal_code: "85004") },
  { first_name: "Diego", last_name: "Fuentes", email: "diego@coppercanyon.coffee", phone: "555-0116", company: companies[11], status: :lead, job_title: "Roaster", city: "Sedona",
    billing: {}, shipping: {} },
  { first_name: "Hannah", last_name: "Cole", email: "hannah@lakesidebooks.com", phone: "555-0117", company: companies[12], status: :churned, job_title: "Owner", city: "Madison",
    billing: seed_address(street: "210 Lake St", city: "Madison", state: "WI", postal_code: "53703"), shipping: {} },
  { first_name: "Victor", last_name: "Lindqvist", email: "victor@vertexarch.com", phone: "555-0118", company: companies[13], status: :lead, job_title: "Principal", city: "Dallas",
    billing: seed_address(street: "400 Design District Blvd", city: "Dallas", state: "TX", postal_code: "75207"),
    shipping: seed_address(street: "400 Design District Blvd", city: "Dallas", state: "TX", postal_code: "75207") },
  { first_name: "June", last_name: "Park", email: "june.parkside@gmail.com", phone: "555-0119", company: nil, status: :lead, job_title: "Independent Planner", city: "Portland",
    billing: seed_address(street: "88 Alder St", city: "Portland", state: "OR", postal_code: "97204"),
    shipping: seed_address(street: "88 Alder St", city: "Portland", state: "OR", postal_code: "97204") },
  { first_name: "Sam", last_name: "Okafor", email: "sam.okafor@gmail.com", phone: "555-0120", company: nil, status: :lead, job_title: "Freelance Photographer", city: "Austin",
    billing: {}, shipping: {} },
]

contacts = contacts_data.map do |data|
  contact = data[:email].present? ? account.contacts.find_or_initialize_by(email: data[:email]) : account.contacts.find_or_initialize_by(first_name: data[:first_name], last_name: data[:last_name])
  contact.assign_attributes(
    first_name: data[:first_name], last_name: data[:last_name], phone: data[:phone],
    company: data[:company], status: data[:status], job_title: data[:job_title], city: data[:city],
    billing_address: data[:billing], shipping_address: data[:shipping], owner: owner
  )
  contact.save!
  contact
end
puts "Contacts: #{account.contacts.kept.count}"

# Deals: original nine plus five more across stages (incl. churned/lost).
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
  { title: "Northwind Flagship Restock", amount: 3400, currency: "USD", contact: contacts[12], company: companies[8], stage: stages[2], expected_close_date: 10.days.from_now, source: "partner" },
  { title: "Bluefin Depot Coffee Run", amount: 950, currency: "USD", contact: contacts[13], company: companies[9], stage: stages[1], expected_close_date: 18.days.from_now, source: "cold outreach" },
  { title: "Sunrise Dental Reception Blend", amount: 700, currency: "USD", contact: contacts[14], company: companies[10], stage: stages[3], expected_close_date: 6.days.from_now, source: "referral" },
  { title: "Vertex Studio Opening", amount: 1800, currency: "USD", contact: contacts[17], company: companies[13], stage: stages[0], expected_close_date: 25.days.from_now, source: "website" },
  { title: "Lakeside Books Holiday Pop-up", amount: 450, currency: "USD", contact: contacts[16], company: companies[12], stage: stages[5], expected_close_date: -6.days.from_now, closed_at: 6.days.ago, source: "event" },
]

deals = deals_data.map do |data|
  deal = account.deals.find_or_initialize_by(title: data[:title])
  deal.assign_attributes(**data, owner: owner, pipeline: pipeline)
  deal.save!
  # find_or_initialize skips the create callback that backfills probability.
  deal.update!(probability: deal.stage.probability) if deal.probability.nil? && deal.stage
  deal
end
puts "Deals: #{account.deals.kept.count}"

# Tags
tags_data = [
  { name: "hot-lead", color: "#EF4444" },
  { name: "cold-lead", color: "#3B82F6" },
  { name: "wholesale", color: "#10B981" },
  { name: "catering", color: "#F59E0B" },
  { name: "new-business", color: "#8B5CF6" },
  { name: "repeat-customer", color: "#06B6D4" },
]

tags = tags_data.map do |data|
  account.tags.find_or_create_by!(name: data[:name]) do |tag|
    tag.color = data[:color]
  end
end
puts "Tags: #{account.tags.count}"

# Taggings (idempotent pairs)
taggings = [
  [tags[0], contacts[0]], [tags[2], contacts[0]], [tags[3], contacts[1]],
  [tags[4], contacts[3]], [tags[5], contacts[5]], [tags[0], contacts[12]],
  [tags[1], contacts[4]], [tags[5], contacts[3]],
  [tags[0], deals[0]], [tags[3], deals[1]], [tags[2], deals[9]],
]
taggings.each do |tag, taggable|
  Tagging.find_or_create_by!(account: account, tag: tag, taggable: taggable)
end
puts "Taggings: #{Tagging.where(account: account).count}"

# Activities
activities_data = [
  { kind: :call, subject: "Discovery call with Mike", description: "Discussed office coffee needs for 30 employees", contact: contacts[0], deal: deals[0], due_at: 2.days.ago },
  { kind: :email, subject: "Sent proposal to Lisa", description: "Emailed catering package options", contact: contacts[1], deal: deals[1], due_at: 1.day.ago },
  { kind: :meeting, subject: "Site visit to Summit", description: "Toured their new office space", contact: contacts[2], deal: deals[2], due_at: 3.days.ago },
  { kind: :task, subject: "Follow up with Maria", description: "Send pricing sheet for weekly delivery", contact: contacts[3], deal: deals[3], due_at: 1.day.from_now },
  { kind: :call, subject: "Follow-up with Maria", description: "Confirmed weekly delivery schedule", contact: contacts[3], deal: deals[3], due_at: 1.day.ago },
  { kind: :task, subject: "Send samples to Tom", description: "Interested in protein bar subscription", contact: contacts[4], deal: deals[4], due_at: 4.days.ago },
  { kind: :email, subject: "Thank you to Emma", description: "Sent thank you after event", contact: contacts[5], deal: deals[5], due_at: 5.days.ago },
  { kind: :task, subject: "Prepare proposal for Harborview", description: "Create custom catering proposal", contact: contacts[6], deal: deals[6], due_at: 2.days.from_now },
  { kind: :meeting, subject: "School fundraiser planning", description: "Met with Rachel to plan coffee station", contact: contacts[7], deal: deals[7], due_at: 5.days.from_now },
  { kind: :call, subject: "Northwind dock access", description: "Grace confirmed receiving hours for restock", contact: contacts[12], deal: deals[9], due_at: 1.day.from_now },
  { kind: :task, subject: "Bluefin tasting kit", description: "Ship tasting kit to the depot office", contact: contacts[13], deal: deals[10], due_at: 3.days.from_now },
  { kind: :meeting, subject: "Sunrise reception walkthrough", description: "Priya showed the new reception layout", contact: contacts[14], deal: deals[11], due_at: 4.days.from_now },
  { kind: :task, subject: "Vertex opening checklist", description: "Confirm guest count and power for carts", contact: contacts[17], deal: deals[12], due_at: 6.days.from_now },
]

activities_data.each do |data|
  record = account.activities.find_or_initialize_by(subject: data[:subject], contact: data[:contact])
  record.assign_attributes(**data, creator: owner)
  record.completed_at ||= (data[:due_at] < Time.current ? data[:due_at] + 1.hour : nil)
  record.save!
end
puts "Activities: #{account.activities.count}"

# Notes
notes_data = [
  { body: "Mike prefers single-origin Ethiopian beans. Allergic to nuts.", notable: contacts[0] },
  { body: "Lisa wants cold brew station for the wedding. Needs 4 servers.", notable: contacts[1] },
  { body: "Summit just moved to new office. 50 employees, kitchen on 3rd floor.", notable: contacts[2] },
  { body: "Maria handles all vendor relationships. Budget approval needed from partner.", notable: contacts[3] },
  { body: "Grace needs invoices to match PO numbers for the flagship restock.", notable: contacts[12] },
  { body: "Priya wants decaf options for the afternoon reception crowd.", notable: contacts[14] },
  { body: "TechStart office coffee service. 30 staff, prefer dark roast. Monthly billing.", notable: deals[0] },
  { body: "Green Leaf catering. Wedding on June 15. 150 guests. Cold brew + espresso.", notable: deals[1] },
]

notes_data.each do |data|
  note = account.notes.find_or_initialize_by(body: data[:body], notable: data[:notable])
  note.author ||= owner
  note.save!
end
puts "Notes: #{account.notes.count}"

# Emails (records only — no delivery)
emails_data = [
  { direction: :outbound, from_address: "sarah@beanandbrew.com", to_addresses: ["mike@techstart.com"], subject: "Re: Office Coffee Service", body: "Hi Mike, thanks for your interest! I've attached our pricing for the office coffee service.", contact: contacts[0], deal: deals[0], status: :sent, sent_at: 2.days.ago, provider_message_id: "seed-out-1", message_id: "<seed-out-1@beanandbrew.com>", thread_key: "<seed-out-1@beanandbrew.com>" },
  { direction: :inbound, from_address: "lisa@greenleafcafe.com", to_addresses: ["sarah@beanandbrew.com"], subject: "Catering Inquiry", body: "Hi Sarah, we're planning a wedding and need coffee service for 150 guests.", contact: contacts[1], deal: deals[1], status: :delivered, sent_at: 3.days.ago, provider_message_id: "seed-in-0" },
  { direction: :inbound, from_address: "mike@techstart.com", to_addresses: ["sarah@beanandbrew.com"], subject: "Re: Office Coffee Service", body: "Thanks Sarah! The pricing looks great — can we schedule a tasting next week?", contact: contacts[0], deal: deals[0], status: :delivered, sent_at: 1.day.ago, provider_message_id: "seed-in-1", message_id: "<seed-in-1@techstart.com>", in_reply_to: "<seed-out-1@beanandbrew.com>", thread_key: "<seed-out-1@beanandbrew.com>" },
  { direction: :outbound, from_address: "sarah@beanandbrew.com", to_addresses: ["james@summitconstruction.com"], subject: "Welcome to Bean & Brew", body: "Hi James, welcome! We'd love to set up a lunch program for your team.", contact: contacts[2], deal: deals[2], status: :sent, sent_at: 1.day.ago },
  { direction: :outbound, from_address: "sarah@beanandbrew.com", to_addresses: ["grace@northwindtraders.com"], subject: "Northwind restock quote", body: "Hi Grace, attached is the restock quote with dock delivery included.", contact: contacts[12], deal: deals[9], status: :sent, sent_at: 1.day.ago },
]

emails_data.each do |data|
  record = account.emails.find_or_initialize_by(subject: data[:subject], contact: data[:contact], direction: data[:direction])
  record.assign_attributes(**data)
  record.save!
end
puts "Emails: #{account.emails.count}"

# Demo custom fields (idempotent so re-seeding is safe)
account.custom_field_definitions.find_or_create_by!(entity_type: "Contact", key: "plan") do |f|
  f.label = "Plan"
  f.field_type = :select
  f.options = { "choices" => %w[free pro enterprise] }
  f.position = 0
end
account.custom_field_definitions.find_or_create_by!(entity_type: "Company", key: "renewal_date") do |f|
  f.label = "Renewal date"
  f.field_type = :date
  f.position = 0
end
contacts[0].update!(custom_data: { "plan" => "enterprise" }) if contacts[0].custom_data.blank?
contacts[1].update!(custom_data: { "plan" => "pro" }) if contacts[1].custom_data.blank?
companies[0].update!(custom_data: { "renewal_date" => 90.days.from_now.to_date.iso8601 }) if companies[0].custom_data.blank?
puts "Seeded #{account.custom_field_definitions.count} custom field definitions"

# Email sequence with steps + one enrollment (shows Outbox/sequences UI).
sequence = account.email_sequences.find_or_create_by!(name: "New lead nurture")
sequence.update!(is_active: true) unless sequence.is_active?
[
  { step_order: 1, delay_days: 0, subject: "Thanks for reaching out, {{first_name}}!" },
  { step_order: 2, delay_days: 3, subject: "Ideas for {{company}}" },
  { step_order: 3, delay_days: 7, subject: "Still thinking it over?" },
].each_with_index do |step, index|
  bodies = [
    "Hi {{first_name}},\n\nThanks for contacting Bean & Brew. We will follow up shortly.",
    "Hi {{first_name}},\n\nHere are two catering setups {{company}} teams usually love.",
    "Hi {{first_name}},\n\nHappy to hold your date with a small deposit.",
  ]
  record = sequence.steps.find_or_initialize_by(step_order: step[:step_order])
  record.assign_attributes(step.merge(body: bodies[index], account: account))
  record.save!
end
SequenceEnrollment.find_or_create_by!(account: account, sequence: sequence, contact: contacts[1]) do |enrollment|
  enrollment.status = :active
  enrollment.current_step = 1
end
puts "Email sequences: #{account.email_sequences.count}"

# Automations (welcome task + hot-deal tag + customer email).
[
  { name: "Welcome new contacts", trigger_type: :contact_created,
    actions: [{ "type" => "create_task", "subject" => "Welcome {{first_name}}",
                "description" => "Send a welcome note within 24 hours.", "due_days" => 1 }] },
  { name: "Tag big deals", trigger_type: :deal_created,
    conditions: { "min_amount" => 1000 },
    actions: [{ "type" => "add_tag", "tag_name" => "hot-lead" }] },
  { name: "Thank new customers", trigger_type: :contact_updated,
    conditions: { "status" => "customer" },
    actions: [{ "type" => "send_email", "subject" => "Welcome aboard!",
                "body" => "Thanks for becoming a Bean & Brew customer." }] },
].each do |data|
  automation = account.automations.find_or_initialize_by(name: data[:name])
  automation.assign_attributes(trigger_type: data[:trigger_type], conditions: data[:conditions] || {},
                               actions: data[:actions], is_active: true)
  automation.save!
end
puts "Automations: #{account.automations.count}"

# Webhook placeholder (inactive so seeds never fire network calls).
account.webhooks.find_or_create_by!(url: "https://example.com/hooks/orders") do |hook|
  hook.events = %w[deal_won]
  hook.secret = "seed-demo-secret"
  hook.is_active = false
end
puts "Webhooks: #{account.webhooks.count}"

puts "\n=== Seed Complete ==="
puts "Login: sarah@beanandbrew.com / password123"
