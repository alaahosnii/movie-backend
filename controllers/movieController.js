const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const movieSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    releaseYear: z.number().int().gte(1888),
    type: z.enum(['MOVIE', 'TV_SHOW']),
    director: z.string().optional(),
    budget: z.number().int().optional(),
    location: z.string().optional(),
    duration: z.number().int().optional(),
    images: z.array(z.string()).optional(),
    poster: z.string().optional(),
});


exports.createMovie = async (req, res) => {
    try {
        const parsed = movieSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }
        let data = { ...parsed.data };
        // Handle poster upload
        let posterUrl = null;
        if (data.poster && data.poster.startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(data.poster, { folder: 'posters' });
            posterUrl = uploadRes.secure_url;
        } else if (data.poster) {
            posterUrl = data.poster;
        }
        // Handle images upload (exclude poster if present in images)
        let imageUrls = [];
        if (data.images && Array.isArray(data.images)) {
            for (const img of data.images) {
                // Exclude if same as posterUrl or base64 poster
                if (
                    (posterUrl && img === posterUrl) ||
                    (data.poster && img === data.poster)
                ) {
                    continue;
                }
                if (img.startsWith('data:image')) {
                    const uploadRes = await cloudinary.uploader.upload(img, { folder: 'images' });
                    imageUrls.push(uploadRes.secure_url);
                } else {
                    imageUrls.push(img);
                }
            }
        }
        // 1. Create Media with images (no poster)
        const movie = await prisma.media.create({
            data: {
                title: data.title,
                description: data.description,
                releaseYear: data.releaseYear,
                type: data.type,
                director: data.director,
                budget: data.budget,
                location: data.location,
                duration: data.duration,
                images: imageUrls.length > 0 ? {
                    create: imageUrls.map(url => ({ url }))
                } : undefined
            }
        });
        let posterImage = null;
        // 2. If poster, create Image and update Media.posterId
        if (posterUrl) {
            posterImage = await prisma.image.create({
                data: {
                    url: posterUrl,
                    mediaId: movie.id
                }
            });
            await prisma.media.update({
                where: { id: movie.id },
                data: { posterId: posterImage.id }
            });
        }
        // 3. Return the full movie with images and poster
        let fullMovie = await prisma.media.findUnique({
            where: { id: movie.id },
            include: {
                images: true,
                poster: true
            }
        });
        if (fullMovie && fullMovie.posterId && Array.isArray(fullMovie.images)) {
            fullMovie.images = fullMovie.images.filter(img => img.id !== fullMovie.posterId);
        }
        res.status(201).json(fullMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filtering and search
        const { releaseYear, director, type, search } = req.query;
        const where = {};
        if (releaseYear) where.releaseYear = parseInt(releaseYear, 10);
        if (director) where.director = { contains: director };
        if (type) where.type = type;
        if (search) {
            where.title = { contains: search };
        }

        const [movies, total] = await Promise.all([
            prisma.media.findMany({ where, skip, take: limit, include: { images: true, poster: true } }),
            prisma.media.count({ where }),
        ]);

        // Filter out poster from images for each movie
        const filteredMovies = movies.map(movie => {
            if (movie && movie.posterId && Array.isArray(movie.images)) {
                movie.images = movie.images.filter(img => img.id !== movie.posterId);
            }
            return movie;
        });

        res.json({
            data: filteredMovies,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const movie = await prisma.media.findUnique({ where: { id }, include: { images: true, poster: true } });
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        if (movie && movie.posterId && Array.isArray(movie.images)) {
            movie.images = movie.images.filter(img => img.id !== movie.posterId);
        }
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const parsed = movieSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }
        let data = { ...parsed.data };
        // Handle poster upload
        let posterUrl = null;
        if (data.poster && data.poster.startsWith('data:image')) {
            const uploadRes = await cloudinary.uploader.upload(data.poster, { folder: 'posters' });
            posterUrl = uploadRes.secure_url;
        } else if (data.poster) {
            posterUrl = data.poster;
        }
        // Handle images upload (exclude poster if present in images)
        let imageUrls = [];
        if (data.images && Array.isArray(data.images)) {
            for (const img of data.images) {
                // Exclude if same as posterUrl or base64 poster
                if (
                    (posterUrl && img === posterUrl) ||
                    (data.poster && img === data.poster)
                ) {
                    continue;
                }
                if (img.startsWith('data:image')) {
                    const uploadRes = await cloudinary.uploader.upload(img, { folder: 'images' });
                    imageUrls.push(uploadRes.secure_url);
                } else {
                    imageUrls.push(img);
                }
            }
        }
        // 1. Update Media fields (excluding images and poster)
        const updatedMovie = await prisma.media.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                releaseYear: data.releaseYear,
                type: data.type,
                director: data.director,
                budget: data.budget,
                location: data.location,
                duration: data.duration
            }
        });
        // 2. If new images provided, delete old and add new
        if (data.images && Array.isArray(data.images)) {
            await prisma.image.deleteMany({ where: { mediaId: id, posterFor: null } });
            if (imageUrls.length > 0) {
                await prisma.image.createMany({
                    data: imageUrls.map(url => ({ url, mediaId: id }))
                });
            }
        }
        // 3. If new poster provided, create and update posterId
        if (posterUrl) {
            // Delete old poster image if exists
            const oldMedia = await prisma.media.findUnique({ where: { id }, include: { poster: true } });
            if (oldMedia && oldMedia.posterId) {
                await prisma.image.delete({ where: { id: oldMedia.posterId } });
            }
            // Create new poster image
            const posterImage = await prisma.image.create({
                data: {
                    url: posterUrl,
                    mediaId: id
                }
            });
            await prisma.media.update({
                where: { id },
                data: { posterId: posterImage.id }
            });
        }
        // 4. Return the full movie with images and poster
        let fullMovie = await prisma.media.findUnique({
            where: { id },
            include: {
                images: true,
                poster: true
            }
        });
        if (fullMovie && fullMovie.posterId && Array.isArray(fullMovie.images)) {
            fullMovie.images = fullMovie.images.filter(img => img.id !== fullMovie.posterId);
        }
        res.json(fullMovie);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        // Delete all related images (including poster)
        await prisma.image.deleteMany({ where: { mediaId: id } });
        await prisma.media.delete({ where: { id } });
        res.status(200).json({
            status: true,
            message: 'Movie deleted successfully',
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.status(500).json({ error: err.message });
    }
}; 