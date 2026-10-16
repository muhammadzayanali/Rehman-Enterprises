from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("inquiries", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="inquiry",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=32),
        ),
    ]
