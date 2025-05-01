using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using WebMOPC.Models;

namespace WebMOPC.Models.Context;

public partial class MopcContext : DbContext
{
    public MopcContext()
    {
    }

    public MopcContext(DbContextOptions<MopcContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bank> Banks { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Diagnosis> Diagnoses { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<MedicalAppointment> MedicalAppointments { get; set; }

    public virtual DbSet<Medication> Medications { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<Position> Positions { get; set; }

    public virtual DbSet<Prescription> Prescriptions { get; set; }

    public virtual DbSet<ServiceType> ServiceTypes { get; set; }

    public virtual DbSet<Staff> Staffs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("server=NAM;database=MOPC;Persist Security Info=True;User ID=sa;Password=1;Encrypt=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bank>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Banks__3214EC27F873EF09");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("ID");
            entity.Property(e => e.Bin).HasMaxLength(550);
            entity.Property(e => e.Code).HasMaxLength(550);
            entity.Property(e => e.Logo).HasMaxLength(550);
            entity.Property(e => e.Name).HasMaxLength(550);
            entity.Property(e => e.ShortName).HasMaxLength(550);
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Departme__3214EC27730DC724");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.HeadId).HasColumnName("HeadID");
            entity.Property(e => e.Name).HasMaxLength(250);
        });

        modelBuilder.Entity<Diagnosis>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Diagnose__3214EC270549E994");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Conclusion).HasMaxLength(250);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.Note).HasMaxLength(250);
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Doctors__3214EC27E6BC1F80");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Cccd)
                .HasMaxLength(250)
                .HasColumnName("CCCD");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.DateOfBirth).HasColumnType("datetime");
            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.Email).HasMaxLength(250);
            entity.Property(e => e.FullName).HasMaxLength(250);
            entity.Property(e => e.Phone).HasMaxLength(250);
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Invoices__3214EC27E0786A3E");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Code).HasMaxLength(250);
            entity.Property(e => e.CreatedBy).HasMaxLength(250);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.PaymentBankId).HasColumnName("PaymentBankID");
            entity.Property(e => e.PrescriptionId).HasColumnName("PrescriptionID");
            entity.Property(e => e.ServiceTypeId).HasColumnName("ServiceTypeID");
        });

        modelBuilder.Entity<MedicalAppointment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MedicalA__3214EC27BA98E1E4");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.DiagnoseId).HasColumnName("DiagnoseID");
            entity.Property(e => e.DoctorId).HasColumnName("DoctorID");
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.MedicalDate).HasColumnType("datetime");
            entity.Property(e => e.PatientId).HasColumnName("PatientID");
        });

        modelBuilder.Entity<Medication>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Medicati__3214EC271850B584");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Supplier).HasMaxLength(150);
            entity.Property(e => e.Unit).HasMaxLength(150);
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Patients__3214EC27F6588289");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Cccd)
                .HasMaxLength(250)
                .HasColumnName("CCCD");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.DateOfBirth).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(250);
            entity.Property(e => e.FullName).HasMaxLength(250);
            entity.Property(e => e.MedicalAppointmentId).HasColumnName("MedicalAppointmentID");
            entity.Property(e => e.Phone).HasMaxLength(250);
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Position__3214EC27E36B7062");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(250);
            entity.Property(e => e.Name).HasMaxLength(250);
        });

        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Prescrip__3214EC277A0378B5");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreatedBy).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.InvoiceId).HasColumnName("InvoiceID");
            entity.Property(e => e.MedicationId).HasColumnName("MedicationID");
        });

        modelBuilder.Entity<ServiceType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ServiceT__3214EC27C7F5F435");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Staffs__3214EC27221FCA0F");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Cccd)
                .HasMaxLength(250)
                .HasColumnName("CCCD");
            entity.Property(e => e.Code).HasMaxLength(150);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.DateOfBirth).HasColumnType("datetime");
            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.Email).HasMaxLength(250);
            entity.Property(e => e.FullName).HasMaxLength(250);
            entity.Property(e => e.Phone).HasMaxLength(250);
            entity.Property(e => e.PositionId).HasColumnName("PositionID");
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC270C3651CE");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Avatar).HasMaxLength(250);
            entity.Property(e => e.Email).HasMaxLength(250);
            entity.Property(e => e.LoginName).HasMaxLength(250);
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.Password).HasMaxLength(250);
            entity.Property(e => e.Phone).HasMaxLength(250);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
