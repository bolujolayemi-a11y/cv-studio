import { useState, useEffect } from 'react'

const LS = 'nursecv-react'
const ACCENTS = ['#2563eb', '#0f766e', '#7c3aed', '#dc2626', '#ea580c', '#0891b2', '#4f46e5', '#059669']
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const emptyEducation = { institution: '', location: '', qualification: '', grade: '', course: '', startYear: '', graduationYear: '' }
const emptyWork = { organisation: '', location: '', title: '', startDate: '', endDate: '', responsibilities: '', achievements: '' }

const emptyProject = { title: '', institution: '', year: '', contribution: '' }
const emptyMembership = { organisation: '', position: '', year: '' }
const emptyAward = { name: '', organisation: '', year: '', details: '' }
const emptyLeadership = { role: '', organisation: '', duration: '', responsibilities: '' }
const emptyReference = { name: '', title: '', organisation: '', phone: '', email: '', relationship: '' }
const emptyRegistration = { body: '', qualification: '', number: '', year: '' }
const emptyVolunteer = { organisation: '', role: '', location: '', duration: '', activities: '' }
const emptyCertification = { name: '', issuer: '', obtained: '', expiry: '' }
const emptySkill = { name: '' }
const emptyOtherInformation = { languages: '', computerSkills: '', other: '' }
const emptyInformation = { languages: '', computerSkills: '', other: '' }
const init = {
  accent: '#2563eb', template: 'ats',
  name: '', title: '', email: '', phone: '', loc: '', link: '', summary: '',
  passport: '',
  certs: '',
  skills: '',
  languages: '', computerSkills: '', otherRelevantInfo: '',
  tech: '', soft: '', mem: '', refs: '',
  educationEntries: [],
  workEntries: [],
  projectEntries: [],
  membershipEntries: [],
  awardEntries: [],
  leadershipEntries: [],
  referenceEntries: [],
  registrationEntries: [],
  volunteerEntries: [],
  certificationEntries: [],
  skillEntries: [],
  otherInformationEntries: [],
  cl: { to: 'Hiring Manager', org: '', orgLocation: '', role: '', date: today(), source: '', experience: '', motivation: '', attachments: '', body: '' },
}
const list = (s) => String(s || '').split(/,|\n/).map((x) => x.trim()).filter(Boolean)
const hasEntryContent = (entry) => Object.values(entry || {}).some((value) => String(value ?? '').trim())

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS))
    if (!saved || typeof saved !== 'object') return init

    const data = { ...init, ...saved, cl: { ...init.cl, ...saved.cl } }
    for (const key of [
      'workEntries', 'projectEntries', 'membershipEntries',
      'awardEntries', 'leadershipEntries', 'referenceEntries', 'registrationEntries',
      'volunteerEntries', 'certificationEntries', 'skillEntries', 'otherInformationEntries',
    ]) {
      data[key] = Array.isArray(saved[key]) ? saved[key].filter(hasEntryContent) : []
    }

    if (Array.isArray(saved.educationEntries)) {
      const educationEntries = saved.educationEntries.filter(hasEntryContent)
      data.educationEntries = educationEntries
    } else if (Array.isArray(saved.edu)) {
      const oldEducation = saved.edu.filter(hasEntryContent).map((entry) => ({
        ...emptyEducation,
        institution: entry.b || '',
        qualification: entry.a || '',
        graduationYear: entry.c || '',
        course: entry.d || '',
      }))
      if (oldEducation.length) data.educationEntries = oldEducation
    }
    if (!data.registrationEntries.length && (saved.professionalBody || saved.professionalQualification || saved.registrationNumber)) {
      data.registrationEntries = [{
        ...emptyRegistration,
        body: saved.professionalBody || '',
        qualification: saved.professionalQualification || '',
        number: saved.registrationNumber || '',
        year: saved.yearRegistered || '',
      }]
    }
    if (!data.certificationEntries.length && saved.certs) {
      data.certificationEntries = String(saved.certs).split('\n').map((name) => name.trim()).filter(Boolean).map((name) => ({ ...emptyCertification, name }))
    }
    if (!data.membershipEntries.length && saved.mem) {
      data.membershipEntries = String(saved.mem).split('\n').map((organisation) => organisation.trim()).filter(Boolean).map((organisation) => ({ ...emptyMembership, organisation }))
    }
    if (!data.referenceEntries.length && saved.refs) {
      data.referenceEntries = [{ ...emptyReference, name: saved.refs }]
    }
    if (!data.skillEntries.length && (saved.skills || saved.tech || saved.soft)) {
      data.skillEntries = [...list(saved.skills || saved.tech), ...list(saved.soft)].map((name) => ({ name }))
    }
    if (!data.otherInformationEntries.length && (saved.languages || saved.computerSkills || saved.otherRelevantInfo)) {
      data.otherInformationEntries = [{
        languages: saved.languages || '',
        computerSkills: saved.computerSkills || '',
        other: saved.otherRelevantInfo || '',
      }]
    }
    data.certs = ''
    data.mem = ''
    data.refs = ''
    data.skills = ''
    data.tech = ''
    data.soft = ''
    data.languages = ''
    data.computerSkills = ''
    data.otherRelevantInfo = ''
    data.professionalBody = ''
    data.professionalQualification = ''
    data.registrationNumber = ''
    data.yearRegistered = ''
    return data
  }
  catch { return init }
}

const Input = ({ label, area, ...p }) => (
  <label>{label}{area ? <textarea {...p} /> : <input {...p} />}</label>
)

function DynamicEntryList({ title, entryName = 'Entry', items, onAdd, onRemove, onChange, fields }) {
  return (
    <>
      <h2>{title}</h2>
      {items.map((item, idx) => (
        <div className="it" key={idx}>
          <button className="rm" type="button" onClick={() => onRemove(idx)}>Remove</button>
          {fields.map((field) => (
            field.textarea ? (
              <Input key={field.key} area label={field.label} placeholder={field.placeholder} value={item[field.key] || ''} onChange={(e) => onChange(idx, field.key, e.target.value)} />
            ) : (
              <Input key={field.key} label={field.label} placeholder={field.placeholder} value={item[field.key] || ''} onChange={(e) => onChange(idx, field.key, e.target.value)} />
            )
          ))}
        </div>
      ))}
      <button type="button" className="add-entry" onClick={onAdd}>
        <span aria-hidden="true">+</span> {items.length ? 'Add another entry' : 'Add entry'}
      </button>
    </>
  )
}

function DynamicSection({ title, entryName, items, onAdd, onRemove, onChange, fields }) {
  return (
    <DynamicEntryList title={title} entryName={entryName} items={items} onAdd={onAdd} onRemove={onRemove} fields={fields} onChange={onChange} />
  )
}

const Sec = ({ t, children }) => <><h3>{t}</h3>{children}</>

function CV({ d }) {
  const registrations = (d.registrationEntries || []).filter(hasEntryContent)
  const education = (d.educationEntries || []).filter(hasEntryContent)
  const work = (d.workEntries || []).filter(hasEntryContent)
  const volunteer = (d.volunteerEntries || []).filter(hasEntryContent)
  const projects = (d.projectEntries || []).filter(hasEntryContent)
  const skills = [...list(d.tech || d.skills), ...(d.skillEntries || []).filter(hasEntryContent).map((entry) => entry.name).filter(Boolean), ...list(d.soft)]
  const memberships = (d.membershipEntries || []).filter(hasEntryContent)
  const awards = (d.awardEntries || []).filter(hasEntryContent)
  const leadership = (d.leadershipEntries || []).filter(hasEntryContent)
  const otherInformation = (d.otherInformationEntries || []).filter(hasEntryContent)
  const references = (d.referenceEntries || []).filter(hasEntryContent)
  const certs = [
    ...String(d.certs).split('\n').map((x) => x.trim()).filter(Boolean),
    ...(d.certificationEntries || []).filter(hasEntryContent).map((entry) => [
      entry.name,
      entry.issuer,
      entry.obtained,
      entry.expiry && `Expires: ${entry.expiry}`,
    ].filter(Boolean).join(' | ')),
  ]
  const name = d.name || 'Your Name'
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  const contactDetails = [d.email, d.phone, d.loc, d.link].filter((value) => value?.trim())
  return (
    <div className={`paper cv-paper ${d.template || 'ats'}`} style={{ '--ac': d.accent }}>
      <div className="cv-header">
        {d.passport
          ? <img src={d.passport} alt="Passport" className="passport-preview" />
          : <div className="cv-avatar" aria-hidden="true">{initials}</div>}
        <div className="cv-heading">
          <h1>{name}</h1>
          {d.title && <div className="ti">{d.title}</div>}
          {contactDetails.length > 0 && (
            <div className="cv-contact">
              {contactDetails.map((detail, idx) => <span key={`${detail}-${idx}`}>{detail}</span>)}
            </div>
          )}
        </div>
      </div>

      <Sec t="Professional summary">{d.summary?.trim() ? <div className="pre">{d.summary}</div> : <div style={{ color: '#999', fontStyle: 'italic' }}>No summary added yet</div>}</Sec>
      {registrations.length > 0 && (
        <Sec t="Professional registration">
          {registrations.map((entry, idx) => (
            <div className="en" key={idx}>
              <div className="t"><span>{entry.qualification || entry.body || 'Professional registration'}</span><i>{entry.year || ''}</i></div>
              {entry.body && entry.qualification && <div className="o">{entry.body}</div>}
              {entry.number && <div>Registration number: {entry.number}</div>}
            </div>
          ))}
        </Sec>
      )}
      {work.length > 0 && (
        <Sec t="Work experience">
          {work.map((entry, idx) => (
            <div className="en" key={idx}>
              <div className="t"><span>{entry.title || 'Role'}</span><i>{entry.startDate || ''}{entry.startDate && entry.endDate ? ' - ' : ''}{entry.endDate || ''}</i></div>
              <div className="o">{entry.organisation || ''}{entry.location ? `, ${entry.location}` : ''}</div>
              {entry.responsibilities && <ul>{entry.responsibilities.split('\n').map((l, j) => <li key={j}>{l.replace(/^[-•*]\s*/, '')}</li>).filter(Boolean)}</ul>}
              {entry.achievements && <div className="o">Major achievements: {entry.achievements}</div>}
            </div>
          ))}
        </Sec>
      )}
      <Sec t="Education">
        {education.length > 0 ? (
          education.map((entry, idx) => (
            <div className="en" key={idx}>
              <div className="t"><span>{[entry.qualification, entry.grade].filter(Boolean).join(' — ') || 'Qualification'}</span><i>{entry.startYear || ''}{entry.startYear && entry.graduationYear ? ' - ' : ''}{entry.graduationYear || ''}</i></div>
              <div className="o">{entry.institution || ''}{entry.location ? `, ${entry.location}` : ''}</div>
              {entry.course && <div className="o">Course: {entry.course}</div>}
            </div>
          ))
        ) : <div className="empty-note">No education added yet</div>}
      </Sec>

      {volunteer.length > 0 && (
        <Sec t="Volunteer / community experience">
          {volunteer.map((entry, idx) => (
            <div className="en" key={idx}>
              <div className="t"><span>{entry.role || 'Volunteer'}</span><i>{entry.duration || ''}</i></div>
              <div className="o">{entry.organisation || ''}{entry.location ? `, ${entry.location}` : ''}</div>
              {entry.activities && <div className="pre">{entry.activities}</div>}
            </div>
          ))}
        </Sec>
      )}
      {projects.length > 0 && (
        <Sec t="Research Work">
          {projects.map((entry, idx) => (
            <div className="en" key={idx}>
              <div className="t"><span>{entry.title || 'Project title'}</span><i>{entry.year || ''}</i></div>
              <div className="o">{entry.institution || ''}</div>
              {entry.contribution && <div className="o">Role/Contribution: {entry.contribution}</div>}
            </div>
          ))}
        </Sec>
      )}
      <Sec t="Key Skills">
        {skills.length > 0 ? (
          <div className="skill-tags">
            {skills.map((skill, idx) => <span className="skill-tag" key={`${skill}-${idx}`}>{skill}</span>)}
          </div>
        ) : <span className="empty-note skill-empty">No skills added yet</span>}
      </Sec>
      {(certs.length > 0 || d.professionalBody || d.professionalQualification) && (
        <Sec t="Certifications & training">
        <ul className="cl">{[...certs, d.professionalBody && `${d.professionalQualification || 'Professional qualification'} | ${d.professionalBody} | Reg. No.: ${d.registrationNumber || 'N/A'}${d.yearRegistered ? ` | ${d.yearRegistered}` : ''}`].filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}</ul>
        </Sec>
      )}
      {memberships.length > 0 && (
        <Sec t="Professional memberships">
          <ul className="cl">
            {memberships.map((entry, idx) => <li key={idx}>{entry.position || 'Membership'} | {entry.organisation || 'Organisation'}{entry.year ? ` | ${entry.year}` : ''}</li>)}
          </ul>
        </Sec>
      )}
      {awards.length > 0 && (
        <Sec t="Awards & achievements">
          {awards.map((entry, idx) => (
            <div className="en" key={idx}><div className="t"><span>{entry.name || 'Award'}</span><i>{entry.year || ''}</i></div><div className="o">{entry.organisation || ''}</div>{entry.details && <div className="pre">{entry.details}</div>}</div>
          ))}
        </Sec>
      )}
      {leadership.length > 0 && (
        <Sec t="Leadership & Extra-curricular Activities">
          {leadership.map((entry, idx) => (
            <div className="en" key={idx}><div className="t"><span>{entry.role || 'Leadership role'}</span><i>{entry.duration || ''}</i></div><div className="o">{entry.organisation || ''}</div>{entry.responsibilities && <div className="pre">{entry.responsibilities}</div>}</div>
          ))}
        </Sec>
      )}
      {otherInformation.length > 0 && (
        <Sec t="Other relevant information">
          {otherInformation.map((entry, idx) => (
            <div className="en" key={idx}>
              {entry.languages && <div><b>Languages spoken:</b> {entry.languages}</div>}
              {entry.computerSkills && <div><b>Computer/IT skills:</b> {entry.computerSkills}</div>}
              {entry.other && <div><b>Other relevant information:</b> {entry.other}</div>}
            </div>
          ))}
        </Sec>
      )}
      {references.length > 0 && (
        <Sec t="References">
          {references.map((entry, idx) => (
            <div className="en" key={idx}><div className="t"><span>{entry.name || 'Referee'}</span><i>{entry.relationship || ''}</i></div><div className="o">{entry.title || ''}{entry.title && entry.organisation ? ' | ' : ''}{entry.organisation || ''}</div>{entry.phone && <div>{entry.phone}</div>}{entry.email && <div>{entry.email}</div>}</div>
          ))}
        </Sec>
      )}

    </div>
  )
}

function Letter({ d }) {
  const c = d.cl
  return (
    <div className={`paper letter ${d.template || 'ats'}`} style={{ '--ac': d.accent }}>
      <div className="letter-sender">
        <div className="letter-sender-name">{d.name || 'Your Name'}</div>
        {[d.loc, d.phone, d.email].filter(Boolean).map((detail, idx) => <div key={`${detail}-${idx}`}>{detail}</div>)}
        <div className="letter-date">{c.date}</div>
      </div>
      <div className="letter-recipient">
        <div>{c.to}</div>
        {c.org && <div>{c.org}</div>}
        {c.orgLocation && <div className="letter-org-location">{c.orgLocation.split(',').map((part) => part.trim()).filter(Boolean).join(',\n')}</div>}
      </div>
      <p className="letter-subject"><strong>Application for {c.role || 'the advertised position'}</strong></p>
      <div className="pre">{c.body || 'Your cover letter draft will appear here.'}</div>
      <p className="letter-signoff">Yours faithfully,<br /><br />{d.name || 'Your Name'}</p>
    </div>
  )
}

export default function App() {
  const [d, setD] = useState(load)
  const [tab, setTab] = useState('cv')
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(d)) } catch {} }, [d])
  const set = (p) => setD((s) => ({ ...s, ...p }))
  const f = (k) => ({ value: d[k], onChange: (e) => set({ [k]: e.target.value }) })
  const cf = (k) => ({ value: d.cl[k], onChange: (e) => set({ cl: { ...d.cl, [k]: e.target.value } }) })
  const handlePassport = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set({ passport: reader.result })
    reader.readAsDataURL(file)
  }
  const draft = () => {
    const c = d.cl
    const organization = c.org.trim() ? ` at ${c.org.trim()}` : ''
    const source = c.source.trim() ? ` through ${c.source.trim()}` : ''
    const experience = c.experience.trim() || d.summary.trim() || '[Briefly describe your relevant experience, skills, or qualifications.]'
    const motivation = c.motivation.trim() || `[Explain why you are interested in this role${c.org.trim() ? ` and ${c.org.trim()}` : ''}.]`
    const attachments = c.attachments.trim() ? `\n\nI have included ${c.attachments.trim()} for your consideration.` : ''
    const body = `Dear ${c.to.trim() || 'Hiring Manager'},\n\nI am writing to apply for ${c.role.trim() || 'the advertised position'}${organization}${source}.\n\n${experience}\n\n${motivation}\n\nI would welcome the opportunity to discuss how my experience and skills could contribute to your team.${attachments}\n\nThank you for your time and consideration.`
    set({ cl: { ...d.cl, body } })
  }
  return (
    <>
      <nav className="topbar">
        <a className="brand" href="#" aria-label="CV Studio home">
          <span className="brand-mark">C</span><span>CV<span className="brand-domain">Studio</span></span>
        </a>
        <div className="tabs" aria-label="Document type">
          <button className={tab === 'cv' ? 'on' : ''} onClick={() => setTab('cv')}>CV</button>
          <button className={tab === 'cl' ? 'on' : ''} onClick={() => setTab('cl')}>Cover letter</button>
        </div>
        <button className="p print-button" onClick={() => window.print()}>Print / Save as PDF</button>
      </nav>
      <main className="page-shell">
        <header className="page-heading">
          <h1>{tab === 'cv' ? 'Build your CV' : 'Write your cover letter'}</h1>
          <p>Enter your details below. Your preview updates as you go.</p>
        </header>
        <div className="wrap">
        <section className="ed">
          <div className="editor-heading">
            <span className="step-dot">1</span>
            <div><strong>{tab === 'cv' ? 'Your details' : 'Letter details'}</strong><span>Start with the essentials</span></div>
          </div>
          <div className="template-picker">
            <label>CV format<select value={d.template} onChange={(e) => set({ template: e.target.value })}>
              <option value="ats">ATS</option>
              <option value="modern">Modern</option>
              <option value="executive">Executive</option>
              <option value="classic">Classic</option>
            </select></label>
          </div>
          <div className="accent-field">
            <label className="accent-label">Accent colour</label>
            <div className="swatches">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={d.accent === c ? 'swatch active' : 'swatch'}
                  style={{ background: c }}
                  onClick={() => set({ accent: c })}
                  aria-label={`Select accent colour ${c}`}
                />
              ))}
              <label className="swatch-custom" title="Custom colour">
                <input type="color" value={d.accent} onChange={(e) => set({ accent: e.target.value })} aria-label="Custom accent colour" />
              </label>
            </div>
          </div>
          {tab === 'cv' ? (
            <>
              <h2>Passport photo</h2>
              <div className="passport-upload-wrap">
                {d.passport ? <img src={d.passport} alt="Passport preview" className="passport-preview" /> : <div className="passport-placeholder">Add passport</div>}
                <input type="file" accept="image/*" onChange={handlePassport} />
                {d.passport && <button type="button" className="rm" onClick={() => set({ passport: '' })}>Remove</button>}
              </div>
              <h2>Personal information</h2>
              <Input label="Full name" {...f('name')} /><Input label="Professional title" {...f('title')} />
              <div className="row"><Input label="Email" {...f('email')} /><Input label="Phone" {...f('phone')} /></div>
              <div className="row"><Input label="Location" {...f('loc')} /><Input label="LinkedIn" {...f('link')} /></div>
              <h2>Professional summary</h2>
              <Input area label="Professional summary" {...f('summary')} />

              <DynamicSection
                title="Educational qualifications"
                entryName="Qualification"
                items={d.educationEntries || []}
                onAdd={() => set({ educationEntries: [...(d.educationEntries || []), { ...emptyEducation }] })}
                onRemove={(i) => set({ educationEntries: (d.educationEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ educationEntries: (d.educationEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'institution', label: 'Institution' },
                  { key: 'location', label: 'Location' },
                  { key: 'qualification', label: 'Qualification / degree' },
                  { key: 'grade', label: 'Degree classification / CGPA', placeholder: 'e.g. Second Class Upper Honours (4.21/5.0 CGPA)' },
                  { key: 'course', label: 'Course / field of study' },
                  { key: 'startYear', label: 'Start year' },
                  { key: 'graduationYear', label: 'Graduation year' },
                ]}
              />

              <DynamicSection
                title="Work experience"
                entryName="Employment"
                items={d.workEntries || []}
                onAdd={() => set({ workEntries: [...(d.workEntries || []), { ...emptyWork }] })}
                onRemove={(i) => set({ workEntries: (d.workEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ workEntries: (d.workEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'organisation', label: 'Organisation / hospital' },
                  { key: 'location', label: 'Location' },
                  { key: 'title', label: 'Job title / position' },
                  { key: 'startDate', label: 'Start date' },
                  { key: 'endDate', label: 'End date' },
                  { key: 'responsibilities', label: 'Key responsibilities', textarea: true },
                  { key: 'achievements', label: 'Major achievements / contributions', textarea: true },
                ]}
              />

              <DynamicSection
                title="Research Work"
                entryName="Project"
                items={d.projectEntries || []}
                onAdd={() => set({ projectEntries: [...(d.projectEntries || []), { ...emptyProject }] })}
                onRemove={(i) => set({ projectEntries: (d.projectEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ projectEntries: (d.projectEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'title', label: 'Title' },
                  { key: 'institution', label: 'Institution / department' },
                  { key: 'year', label: 'Year' },
                  { key: 'contribution', label: 'Role / contribution', textarea: true },
                ]}
              />

              <DynamicSection
                title="Professional registration"
                entryName="Registration"
                items={d.registrationEntries || []}
                onAdd={() => set({ registrationEntries: [...(d.registrationEntries || []), { ...emptyRegistration }] })}
                onRemove={(i) => set({ registrationEntries: (d.registrationEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ registrationEntries: (d.registrationEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'body', label: 'Professional body' },
                  { key: 'qualification', label: 'Professional qualification' },
                  { key: 'number', label: 'Registration number' },
                  { key: 'year', label: 'Year registered' },
                ]}
              />

              <DynamicSection
                title="Volunteer / community experience"
                entryName="Volunteer experience"
                items={d.volunteerEntries || []}
                onAdd={() => set({ volunteerEntries: [...(d.volunteerEntries || []), { ...emptyVolunteer }] })}
                onRemove={(i) => set({ volunteerEntries: (d.volunteerEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ volunteerEntries: (d.volunteerEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'organisation', label: 'Organisation / programme' },
                  { key: 'role', label: 'Role' },
                  { key: 'location', label: 'Location' },
                  { key: 'duration', label: 'Date / duration' },
                  { key: 'activities', label: 'Activities / responsibilities', textarea: true },
                ]}
              />

              <DynamicSection
                title="Certifications & training"
                entryName="Certificate"
                items={d.certificationEntries || []}
                onAdd={() => set({ certificationEntries: [...(d.certificationEntries || []), { ...emptyCertification }] })}
                onRemove={(i) => set({ certificationEntries: (d.certificationEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ certificationEntries: (d.certificationEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'name', label: 'Certificate / training' },
                  { key: 'issuer', label: 'Issuing organisation' },
                  { key: 'obtained', label: 'Date' },
                  { key: 'expiry', label: 'Expiry date' },
                ]}
              />

              <DynamicSection
                title="Skills"
                entryName="Skill"
                items={d.skillEntries || []}
                onAdd={() => set({ skillEntries: [...(d.skillEntries || []), { ...emptySkill }] })}
                onRemove={(i) => set({ skillEntries: (d.skillEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ skillEntries: (d.skillEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[{ key: 'name', label: 'Key skill' }]}
              />

              <DynamicSection
                title="Professional memberships"
                entryName="Membership"
                items={d.membershipEntries || []}
                onAdd={() => set({ membershipEntries: [...(d.membershipEntries || []), { ...emptyMembership }] })}
                onRemove={(i) => set({ membershipEntries: (d.membershipEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ membershipEntries: (d.membershipEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'organisation', label: 'Organisation' },
                  { key: 'position', label: 'Membership / position' },
                  { key: 'year', label: 'Year' },
                ]}
              />

              <DynamicSection
                title="Awards & achievements"
                entryName="Award"
                items={d.awardEntries || []}
                onAdd={() => set({ awardEntries: [...(d.awardEntries || []), { ...emptyAward }] })}
                onRemove={(i) => set({ awardEntries: (d.awardEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ awardEntries: (d.awardEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'name', label: 'Award / achievement' },
                  { key: 'organisation', label: 'Organisation / institution' },
                  { key: 'year', label: 'Year' },
                  { key: 'details', label: 'Details', textarea: true },
                ]}
              />

              <DynamicSection
                title="Leadership & Extra-curricular Activities"
                entryName="Leadership role"
                items={d.leadershipEntries || []}
                onAdd={() => set({ leadershipEntries: [...(d.leadershipEntries || []), { ...emptyLeadership }] })}
                onRemove={(i) => set({ leadershipEntries: (d.leadershipEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ leadershipEntries: (d.leadershipEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'role', label: 'Position / role' },
                  { key: 'organisation', label: 'Organisation / institution' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'responsibilities', label: 'Responsibilities', textarea: true },
                ]}
              />

              <DynamicSection
                title="Other relevant information"
                entryName="Information"
                items={d.otherInformationEntries || []}
                onAdd={() => set({ otherInformationEntries: [...(d.otherInformationEntries || []), { ...emptyOtherInformation }] })}
                onRemove={(i) => set({ otherInformationEntries: (d.otherInformationEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ otherInformationEntries: (d.otherInformationEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'languages', label: 'Languages spoken', textarea: true },
                  { key: 'computerSkills', label: 'Computer / IT skills', textarea: true },
                  { key: 'other', label: 'Other relevant experience or information', textarea: true },
                ]}
              />

              <DynamicSection
                title="References"
                entryName="Referee"
                items={d.referenceEntries || []}
                onAdd={() => set({ referenceEntries: [...(d.referenceEntries || []), { ...emptyReference }] })}
                onRemove={(i) => set({ referenceEntries: (d.referenceEntries || []).filter((_, idx) => idx !== i) })}
                onChange={(idx, key, value) => set({ referenceEntries: (d.referenceEntries || []).map((entry, i) => i === idx ? { ...entry, [key]: value } : entry) })}
                fields={[
                  { key: 'name', label: 'Full name' },
                  { key: 'title', label: 'Job title / profession' },
                  { key: 'organisation', label: 'Organisation' },
                  { key: 'phone', label: 'Phone number' },
                  { key: 'email', label: 'Email' },
                  { key: 'relationship', label: 'Relationship to applicant' },
                ]}
              />
            </>
          ) : (
            <>
              <h2>Cover letter</h2>
              <Input label="Hiring manager / recipient" {...cf('to')} /><Input label="Organisation" {...cf('org')} />
              <Input label="Organisation location / address" {...cf('orgLocation')} />
              <Input label="Position applying for" {...cf('role')} /><Input label="Date" {...cf('date')} />
              <Input label="Where you found the role (optional)" placeholder="e.g. Company website, LinkedIn" {...cf('source')} />
              <Input area label="Relevant experience, skills, or qualifications" placeholder="Highlight experience and strengths that relate to this role." {...cf('experience')} />
              <Input area label="Why you are interested (optional)" placeholder="What interests you about this role or organisation?" {...cf('motivation')} />
              <Input label="Supporting documents (optional)" placeholder="e.g. CV, portfolio, or references" {...cf('attachments')} />
              <button className="p full" onClick={draft}>Generate cover letter draft</button>
              <Input area label="Letter body (edit freely)" style={{ minHeight: 260 }} {...cf('body')} />
            </>
          )}
        </section>
        <section className="preview-panel">
          <div className="preview-heading"><div><span>LIVE PREVIEW</span><strong>{tab === 'cv' ? 'Your CV' : 'Your cover letter'}</strong></div><span className="live-dot">Live</span></div>
          <div className="pw">{tab === 'cv' ? <CV d={d} /> : <Letter d={d} />}</div>
        </section>
        </div>
      </main>
    </>
  )
}
