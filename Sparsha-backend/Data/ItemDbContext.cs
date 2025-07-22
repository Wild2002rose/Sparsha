using Microsoft.EntityFrameworkCore;
using Sparsha_backend.Models;

namespace Sparsha_backend.Data
{
    public class ItemDbContext : DbContext
    {
        public ItemDbContext(DbContextOptions<ItemDbContext> options) : base(options) { }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<LoginLog> LoggedSellers { get; set; } 
        public DbSet<ClientLoginLog> LoggedClients { get; set; }
        public DbSet<ItemOfSellers> ItemOfSellers  { get; set; }
        public DbSet<Items> GlobalItems { get; set; }
        public DbSet<WishlistItems> WishlistItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItems> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Bid> Bids { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Seller>()
                .HasKey(s => s.SellerId);

            modelBuilder.Entity<Seller>()
                .HasOne(s => s.Member)
                .WithOne(m => m.Seller)
                .HasForeignKey<Seller>(s => s.SellerId);

            modelBuilder.Entity<Client>()
                .HasKey(c => c.ClientId);

            modelBuilder.Entity<Client>()
                .HasOne(c => c.Member)
                .WithOne(m => m.Client)
                .HasForeignKey<Client>(c => c.ClientId);

            modelBuilder.Entity<ItemOfSellers>()
                .HasOne(i => i.Seller)
                .WithMany(s => s.ItemOfSellers)
                .HasForeignKey(i => i.SellerId)
                .OnDelete(DeleteBehavior.Cascade);
            
        }



    }
}
